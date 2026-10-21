import { describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { dropPieceDown } from "../../src/game/dropPieceDown";
import { createPiece } from "../../src/game/pieces";

describe("dropPieceDown", () => {
	it("baja la pieza hasta el suelo, sin modificar la original", () => {
		const board = createEmptyBoard();
		const piece = createPiece("O"); //empieza en x = 4, y = 0

		const dropped = dropPieceDown(board, piece);

		expect(dropped.y).toBe(18); //la O ocupa 2 filas: 18 y 19 (el suelo)
		expect(dropped.x).toBe(4); //no se mueve de lado
		expect(piece.y).toBe(0); //la pieza original no ha cambiado
	});

	it("se detiene encima de las piezas apiladas", () => {
		const board = createEmptyBoard();
		board[10][4] = 1; //un bloque en la fila 10, columna 4
		const piece = createPiece("O"); //ocupa las columnas 4 y 5

		const dropped = dropPieceDown(board, piece);

		expect(dropped.y).toBe(8); //ocupa las filas 8 y 9, justo encima del bloque

		expect(dropPieceDown(board, dropped)).toBe(dropped); //si ya no puede bajar, devuelve la misma pieza
	});
});