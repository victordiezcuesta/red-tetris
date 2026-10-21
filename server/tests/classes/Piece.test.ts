import { describe, expect, it } from "vitest";
import { Piece, PIECE_TYPES } from "../../src/classes/Piece.js";

describe("Piece", () => {
	it("guarda el tipo que le pasamos", () => {
		const piece = new Piece("T");

		expect(piece.type).toBe("T");
	});

	it("random siempre devuelve un tipo válido", () => {
		for (let i = 0; i < 100; i++)
		{
			const piece = Piece.random();

			expect(PIECE_TYPES).toContain(piece.type); //toContain: el array contiene ese valor
		}
	});

});