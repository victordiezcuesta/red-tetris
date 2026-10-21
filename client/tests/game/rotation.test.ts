import { describe, expect, it } from "vitest";
import { SHAPES, createPiece } from "../../src/game/pieces";
import { rotatePiece, rotateShape } from "../../src/game/rotation";

describe("rotateShape", () => {
	it("gira la T 90 grados hacia la derecha", () => {
		const rotated = rotateShape(SHAPES.T);

		expect(rotated).toEqual([
			[0, 3, 0],
			[0, 3, 3],
			[0, 3, 0],
		]);
	});

	it("cuatro giros devuelven la forma original", () => {
		let shape = SHAPES.L;

		for (let i = 0; i < 4; i++)
		{
			shape = rotateShape(shape);
		}

		expect(shape).toEqual(SHAPES.L);
	});
});

describe("rotatePiece", () => {
	it("gira la forma pero mantiene tipo y posición, sin modificar la original", () => {
		const piece = createPiece("T");
		const rotated = rotatePiece(piece);

		expect(rotated.shape).toEqual(rotateShape(SHAPES.T));
		expect(rotated.type).toBe("T");
		expect(rotated.x).toBe(piece.x);
		expect(rotated.y).toBe(piece.y);
		expect(piece.shape).toEqual(SHAPES.T); //la pieza original no ha cambiado
	});
});