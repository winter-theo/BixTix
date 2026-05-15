import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createProductSchema } from "@/lib/validations/product";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/products
 * Retourne la liste de tous les produits actifs
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

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
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      console.warn("Validation echouee POST /api/products:", validation.error.flatten().fieldErrors);
      return NextResponse.json(
        {
          error: "Donnees invalides",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

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