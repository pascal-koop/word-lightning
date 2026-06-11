/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative Pfade ('./') sind nötig, weil Capacitor die Dateien nicht über
  // eine Domain, sondern lokal aus dem App-Bundle lädt (capacitor://).
  // Im Web funktioniert das ebenfalls, solange die App im Root deployed wird.
  base: "./",
  server: {
    host: true,
  },
  // Vites Dependency-Scanner würde sonst auch das gebundelte index.html in
  // ios/App/App/public/ einlesen und über optionale Peer-Deps wie
  // "@emotion/is-prop-valid" stolpern, die nur in der Production-Bundle
  // referenziert sind. Wir scannen darum explizit nur das Root-index.html.
  optimizeDeps: {
    entries: ["index.html"],
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      // The "v8" provider uses the V8 engine's built-in coverage and needs
      // no source-code instrumentation, which keeps the test runtime small.
      provider: "v8",
      // "json-summary" is what the GitHub Action below reads to render the
      // PR comment; "lcov" is useful for editors / external dashboards;
      // "text" prints a human-readable table during the local run.
      reporter: ["text", "json-summary", "json", "lcov"],
      // Ensure the report is still written when individual tests fail, so
      // CI can attach the coverage comment even on a red run.
      reportOnFailure: true,
      // We only measure coverage for the pure-logic layer of the app.
      // UI components and the IndexedDB layer would require a DOM /
      // jsdom setup, which we deliberately defer to keep CI fast and the
      // 70% rule meaningful for the code that is *expected* to be tested.
      include: ["src/game/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/*.d.ts",
        // "questions.ts" is a static prompt list, not behavioural code.
        "src/game/questions.ts",
      ],
      thresholds: {
        lines: 70,
        statements: 70,
        functions: 70,
        branches: 70,
      },
    },
  },
});
