import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Playwright specs under e2e/ use @playwright/test, not Vitest — keep them out.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    // Mirror the tsconfig `@/*` path alias so imports resolve in tests.
    alias: { "@": rootDir },
  },
});
