//vite es una herramienta que traduce y empaqueta tu código para el navegador
//Express no entiende .tsx, así que Vite lo traduce una vez, antes de arrancar el servidor. El resultado queda guardado en client/dist

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        entryFileNames: "bundle.js", //cambiamoss el nombre al js que generamos al traducir el tsx a js para que express lo entienda, lo llamamos asi porque lo exige el subject
      },
    },
  },

  test: {
    environment: "jsdom", //jsdom simula un navegador con windows, etc...
    setupFiles: ["./tests/setup.ts"], //fichero que se ejecuta antes de cada fichero de tests.
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/main.tsx", "src/vite-env.d.ts", "src/App.tsx"],
      reporter: ["text", "html"],
      thresholds: {
        statements: 70,
        functions: 70,
        lines: 70,
        branches: 50,
      },
    },
  },
});
