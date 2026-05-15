import { test, expect } from "@playwright/test";

test.describe("Panier", () => {
  test("Affiche un message d'invitation a se connecter quand non auth", async ({ page }) => {
    await page.goto("/panier");
    await expect(page.locator("body")).toContainText(/connecte/i);
  });
});