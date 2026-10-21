import { describe, expect, it } from "vitest";
import { PIECE_TYPES, SHAPES, createPiece } from "../../src/game/pieces";

describe("createPiece", () => {
	it("crea la pieza arriba del tablero y centrada", () => {
		const piece = createPiece("T");

		expect(piece.type).toBe("T");
		expect(piece.shape).toEqual(SHAPES.T);
		expect(piece.x).toBe(3); //(10 columnas - 3 de ancho) / 2 = 3.5 -> 3
		expect(piece.y).toBe(0);

		expect(createPiece("O").x).toBe(4); //la O mide 2 de ancho: (10 - 2) / 2 = 4
	});

	it("los 7 tipos tienen una forma definida", () => {
		expect(PIECE_TYPES).toHaveLength(7);

		for (let i = 0; i < PIECE_TYPES.length; i++)
		{
			expect(SHAPES[PIECE_TYPES[i]]).toBeDefined();
		}
	});
});