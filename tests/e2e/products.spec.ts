import { test, expect } from "@playwright/test";

test.describe("Pages publiques", () => {
  test("Accueil affiche le titre BixTix", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("BixTix");
  });

  test("Page produits charge sans erreur", async ({ page }) => {
    const response = await page.goto("/produits");
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe("CRUD produits via API REST", () => {
  test("GET /api/products retourne un tableau de produits", async ({ request }) => {
    const response = await request.get("/api/products");
    expect(response.status()).toBe(200);
    const products = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test("GET /api/products/[id] retourne un produit valide", async ({ request }) => {
    const list = await request.get("/api/products");
    const products = await list.json();
    const firstId = products[0].id;

    const detail = await request.get(`/api/products/${firstId}`);
    expect(detail.status()).toBe(200);
    const product = await detail.json();
    expect(product.id).toBe(firstId);
    expect(product.name).toBeTruthy();
  });

  test("GET /api/products/[id] retourne 404 si id inexistant", async ({ request }) => {
    const response = await request.get("/api/products/inexistant-xyz-123");
    expect(response.status()).toBe(404);
  });

  test("GET /api/products/stats retourne des stats agregees", async ({ request }) => {
    const response = await request.get("/api/products/stats");
    expect(response.status()).toBe(200);
  });

  test("GET /api/products/search filtre par requete", async ({ request }) => {
    const response = await request.get("/api/products/search?q=Starter");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("results");
    expect(data).toHaveProperty("count");
  });

  test("POST /api/products refuse les donnees invalides (validation Zod)", async ({ request }) => {
    const response = await request.post("/api/products", {
      data: { name: "a" },
    });
    expect(response.status()).toBe(400);
  });
});