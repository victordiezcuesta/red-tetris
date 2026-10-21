
import { describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { hasCollision } from "../../src/game/collision";
import { createPiece } from "../../src/game/pieces";

describe("hasCollision", () => {
	it("no hay colisión si la pieza está dentro y el sitio está libre", () => {
		const board = createEmptyBoard();

		expect(hasCollision(board, createPiece("O"))).toBe(false);
		expect(hasCollision(board, { ...createPiece("O"), y: -1 })).toBe(false); //parte por encima del tablero: se ignora
	});

	it("hay colisión con las paredes, el suelo y las piezas apiladas", () => {
		const board = createEmptyBoard();

		expect(hasCollision(board, { ...createPiece("O"), x: -1 })).toBe(true); //pared izquierda
		expect(hasCollision(board, { ...createPiece("O"), x: 9 })).toBe(true); //pared derecha (ocupa columnas 9 y 10)
		expect(hasCollision(board, { ...createPiece("O"), y: 19 })).toBe(true); //suelo (ocupa filas 19 y 20)

		board[19][4] = 1; //ponemos un bloque en el suelo
		expect(hasCollision(board, { ...createPiece("O"), y: 18 })).toBe(true); //la O (columnas 4 y 5) toca ese bloque
		expect(hasCollision(board, { ...createPiece("O"), y: 17 })).toBe(false); //una fila más arriba no lo toca
	});
});