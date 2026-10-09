import { describe, expect, it } from "vitest";
import { isValidName } from "../src/utils/validate.js";

describe("isValidName", () => { //describe: agrupa tests relacionados bajo un nombre
  it("accepts letters, digits, hyphens and underscores", () => { //it: un test individual, con una frase que describe qué comportamiento comprueba
    expect(isValidName("victor")).toBe(true); //esperamos de este valor que sea este otro valor, si es distinto el test falla
    expect(isValidName("sala_1-b")).toBe(true);
  });

  it("rejects empty, too long and special-character names", () => {
    expect(isValidName("")).toBe(false);
    expect(isValidName("a".repeat(21))).toBe(false);
    expect(isValidName("ho la")).toBe(false);
    expect(isValidName("<script>")).toBe(false);
  });
});
