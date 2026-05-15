import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/queries/products";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Recherche avancee avec filtres et tri
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") ?? undefined;
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") as
      | "name"
      | "price"
      | "createdAt"
      | null;
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;

    const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
    const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;

    const products = await searchProducts({
      search,
      minPrice,
      maxPrice,
      sortBy: sortBy ?? undefined,
      sortOrder: sortOrder ?? undefined,
    });
    return NextResponse.json(
      {
        results: products,
        count: products.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur GET /api/products/search:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}