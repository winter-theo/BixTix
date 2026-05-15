import { NextRequest, NextResponse } from "next/server";
import { getProductStats } from "@/lib/queries/products";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/products/stats
 * Retourne les statistiques agregees du catalogue
 */
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  try {
    const stats = await getProductStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/products/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}