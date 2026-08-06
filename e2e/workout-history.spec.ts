import { test, expect } from "@playwright/test";

test.describe("Workout History — authenticated", () => {
  test("renders the server-rendered history page", async ({ page }) => {
    await page.goto("/workouts/history");

    // The page is an async Server Component; assert its server-rendered shell.
    // The table renders even with zero rows, so this holds regardless of seed data.
    await expect(page.getByRole("heading", { name: "Workout History" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
  });
});

test.describe("Workout History — logged out", () => {
  // Drop the shared authenticated session for this block.
  test.use({ storageState: { cookies: [], origins: [] } });

  test("redirects to /login (middleware guard)", async ({ page }) => {
    await page.goto("/workouts/history");
    await expect(page).toHaveURL(/\/login/);
  });
});
