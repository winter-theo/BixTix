// Fonctions de lecture du panier
import { prisma } from "@/lib/prisma";

/**
 * Recupere le panier d'un utilisateur avec tous ses items et produits.
 * Si l'utilisateur n'a pas encore de panier, retourne null.
 */
export async function getCartByUserId(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Compte le nombre total d'articles dans le panier (somme des quantites).
 * Utilise pour le badge dans le header.
 */
export async function getCartItemCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        select: { quantity: true },
      },
    },
  });

  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Calcule le total du panier (quantite x prix de chaque item).
 * Retourne 0 si pas de panier.
 */
export async function getCartTotal(userId: string): Promise<number> {
  const cart = await getCartByUserId(userId);
  if (!cart) return 0;

  return cart.items.reduce((total, item) => {
    return total + item.quantity * Number(item.product.price);
  }, 0);
}