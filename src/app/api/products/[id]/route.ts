import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/products/[id]
 * Retourne un produit avec ses relations (items du panier, licences associees)
 */
export async function GET(request: NextRequest, { params }: Params) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
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