import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", //los test corren en node puro
    include: ["tests/**/*.test.ts"], //vitest solo ejecuta los archos de la carpeta test acabados en .test.ts
    coverage: { // cuanto del codigo comprobamos
      provider: "v8", //motor de JavaScript de Node
      include: ["src/**/*.ts"], //solo combromamos los src que son typescripts
      exclude: ["src/index.ts"],
      reporter: ["text", "html"], //como se muestra el resultado: text es la tabla en la terminal y html es un informe navegable en coverage/index.html
      thresholds: {
        statements: 70, //se refiere a todas las operaciones de una funcion, que puede ser asignaciones, sumas, llamadas a otras funciones, etc...
        functions: 70,
        lines: 70,
        branches: 50, //caminos posibles que puede seguir una condición
      },
    },
  },
});
