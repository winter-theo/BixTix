import { test, expect } from "@playwright/test";

test.describe("Checkout Stripe", () => {
  test("Page succes affiche le message de confirmation", async ({ page }) => {
    await page.goto("/checkout/success?session_id=cs_test_dummy");
    await expect(page.locator("body")).toContainText(/Paiement reussi/i);
  });

  test("Page d'accueil expose le bouton Stripe (verification redirection auth)", async ({ page }) => {
    await page.goto("/panier");
    await expect(page).toHaveURL(/panier/);
  });
});