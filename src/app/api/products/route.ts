import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product";

/**
 * GET /api/products
 * Retourne la liste de tous les produits actifs
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/products:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Cree un nouveau produit (validation Zod du body JSON)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation Zod (meme schema que les Server Actions)
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Donnees invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Creation en BD
    const product = await prisma.product.create({
      data: {
        name: validation.data.name,
        slug: validation.data.slug,
        description: validation.data.description,
        price: validation.data.price,
        imageUrl: validation.data.imageUrl || null,
        isActive: validation.data.isActive ?? true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/products:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}