import { prisma } from "@/lib/prisma";

/**
 * Type des options de recherche.
 * Tous les champs sont optionnels - on combine ce qui est fourni.
 */
export type ProductSearchOptions = {
  search?: string;              // Recherche dans nom + description
  minPrice?: number;            // Prix minimum
  maxPrice?: number;            // Prix maximum
  isActive?: boolean;           // Filtrer par statut
  sortBy?: "name" | "price" | "createdAt"; // Champ de tri
  sortOrder?: "asc" | "desc";   // Ordre de tri
};

/**
 * Recherche avancee de produits avec filtres dynamiques et tri.
 * Utilise contains, gte, lte et orderBy de Prisma.
 */
export async function searchProducts(options: ProductSearchOptions = {}) {
  const {
    search,
    minPrice,
    maxPrice,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  // Construction dynamique de la clause WHERE
  // On ne met les conditions QUE si elles sont fournies
  const where: {
    OR?: Array<{ name?: { contains: string; mode: "insensitive" }; description?: { contains: string; mode: "insensitive" } }>;
    price?: { gte?: number; lte?: number };
    isActive?: boolean;
  } = {};

  // Recherche textuelle dans nom OU description (insensible a la casse)
  if (search && search.trim().length > 0) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filtre par plage de prix
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Filtre par statut actif
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  // Execution de la requete avec relations chargees
  const products = await prisma.product.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    include: {
      // Charge le nombre de relations sans charger les donnees completes
      _count: {
        select: {
          orderItems: true,
          licenses: true,
        },
      },
    },
  });

  return products;
}

/**
 * Recupere un produit par son slug avec ses relations.
 * Exemple d'utilisation de include pour charger les relations.
 */
export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      // Relations completes (utile pour la page detail produit)
      _count: {
        select: {
          orderItems: true,
          licenses: true,
        },
      },
    },
  });
}

/**
 * Statistiques globales du catalogue.
 * Utilise plusieurs agregations en parallele avec Promise.all.
 */
export async function getProductStats() {
  // On execute 4 requetes en parallele pour gagner du temps
  const [totalCount, activeCount, priceStats, productsByStatus] =
    await Promise.all([
      // 1. Nombre total de produits
      prisma.product.count(),

      // 2. Nombre de produits actifs
      prisma.product.count({ where: { isActive: true } }),

      // 3. Statistiques sur le prix (avg, min, max, sum)
      prisma.product.aggregate({
        where: { isActive: true },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
        _sum: { price: true },
      }),

      // 4. Groupement : nombre de produits par statut (actif/inactif)
      prisma.product.groupBy({
        by: ["isActive"],
        _count: { id: true },
      }),
    ]);

  return {
    totalCount,
    activeCount,
    priceStats: {
      avg: priceStats._avg.price ? Number(priceStats._avg.price) : 0,
      min: priceStats._min.price ? Number(priceStats._min.price) : 0,
      max: priceStats._max.price ? Number(priceStats._max.price) : 0,
      sum: priceStats._sum.price ? Number(priceStats._sum.price) : 0,
    },
    productsByStatus: productsByStatus.map((p) => ({
      isActive: p.isActive,
      count: p._count.id,
    })),
  };
}

// Nombre d'items par page (constante facilement modifiable)
const ITEMS_PER_PAGE = 5;

/**
 * Pagination par offset (skip/take).
 * Retourne les produits de la page demandee + les metadonnees.
 */
export async function getProductsPaginated(page: number = 1) {
  // Securite : la page doit etre >= 1
  const currentPage = Math.max(1, page);
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  // Promise.all pour executer les 2 requetes en parallele
  // (1 pour les donnees, 1 pour le total)
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  // Calcul du nombre total de pages (arrondi au superieur)
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return {
    products,
    pagination: {
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage: ITEMS_PER_PAGE,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    },
  };
}