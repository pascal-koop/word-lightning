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
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
