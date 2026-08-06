import { test as setup, expect } from "@playwright/test";

const authFile = "e2e/.auth/user.json";

// Logs in through the real UI once and saves the resulting session (the httpOnly
// wt_access/wt_refresh cookies) to storageState, which the test project reuses.
// Credentials come from the environment so they never live in the repo.
setup("authenticate", async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  if (!username) {
    throw new Error(
      "Set E2E_USERNAME (a seeded .NET user) to run E2E tests, e.g. `E2E_USERNAME=alice npx playwright test`.",
    );
  }
  const password = process.env.E2E_PASSWORD ?? ""; // SimpleLogin bypasses the password

  await page.goto("/login");
  await page.getByPlaceholder("username").fill(username);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: /login/i }).click();

  // Login redirects to the home page on success.
  await page.waitForURL("/");
  await page.context().storageState({ path: authFile });
});
