import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

//Despues de cada test tenemos que limpiar los componentes que hemos printeado en la pantalla
afterEach(() => cleanup());