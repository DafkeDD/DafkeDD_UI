import { defineConfig } from "vitest/config";

// Unit- en componenttests. De browsertest (echte Chrome) staat apart in scripts/ui-test.mjs.
export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["tests/setup.ts"],
    restoreMocks: true,
    // De CLI-tests schrijven in tijdelijke mappen en starten node-processen.
    testTimeout: 20_000,
  },
});
