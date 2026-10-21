import { describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { mergePiece } from "../../src/game/merge";
import { createPiece } from "../../src/game/pieces";

describe("mergePiece", () => {
	it("fija la pieza en un tablero nuevo sin modificar el original", () => {
		const board = createEmptyBoard();
		const piece = createPiece("T"); //x = 3, y = 0

		const merged = mergePiece(board, piece);

		// la T ocupa: (fila 0, col 4) y (fila 1, cols 3, 4 y 5)
		expect(merged[0][4]).toBe(3);
		expect(merged[1][3]).toBe(3);
		expect(merged[1][4]).toBe(3);
		expect(merged[1][5]).toBe(3);
		/*
		[0, 3, 0],
		[3, 3, 3],
		[0, 0, 0],*/

		expect(merged[0][3]).toBe(0); //la parte vacía de la forma no pinta nada
		expect(board[0][4]).toBe(0); //el tablero original no ha cambiado
	});

	it("ignora la parte de la pieza que queda por encima del tablero", () => {
		const board = createEmptyBoard();
		const piece = { ...createPiece("T"), y: -1 }; //su primera fila queda fuera

		const merged = mergePiece(board, piece); //no da error

		expect(merged[0][3]).toBe(3); //la segunda fila de la T cae en la fila 0
		expect(merged[0][4]).toBe(3);
		expect(merged[0][5]).toBe(3);
		expect(merged[1][4]).toBe(0); //no ha pintado nada más abajo
	});
});