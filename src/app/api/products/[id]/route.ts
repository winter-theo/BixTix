import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/products/[id]
 * Retourne un produit avec ses relations (items du panier, licences associees)
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        // Charge les relations pour avoir un payload complet
        _count: {
          select: {
            cartItems: true,
            orderItems: true,
            licenses: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/products/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}