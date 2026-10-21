import { describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { createPiece } from "../../src/game/pieces";
import { moveDown, moveLeft, moveRight, tryRotate } from "../../src/game/movement";
import { rotatePiece } from "../../src/game/rotation";

describe("moveLeft, moveRight y moveDown", () => {
	it("mueven la pieza una casilla si hay sitio, sin modificar la original", () => {
		const board = createEmptyBoard();
		const piece = createPiece("O"); //empieza en x = 4, y = 0

		expect(moveLeft(board, piece).x).toBe(3);
		expect(moveRight(board, piece).x).toBe(5);
		expect(moveDown(board, piece).y).toBe(1);
		expect(piece.x).toBe(4); //la pieza original no ha cambiado
	});

	it("devuelven la misma pieza si chocan", () => {
		const board = createEmptyBoard();
		const left = { ...createPiece("O"), x: 0 };
		const right = { ...createPiece("O"), x: 8 };
		const bottom = { ...createPiece("O"), y: 18 };

		expect(moveLeft(board, left)).toBe(left); //toBe: es exactamente el mismo objeto
		expect(moveRight(board, right)).toBe(right);
		expect(moveDown(board, bottom)).toBe(bottom);
	});
});

describe("tryRotate", () => {
	it("gira la pieza si hay sitio", () => {
		const board = createEmptyBoard();
		const piece = createPiece("T");

		expect(tryRotate(board, piece)).toEqual(rotatePiece(piece));
	});

	it("no gira la pieza si la forma girada choca con la pila", () => {
		const board = createEmptyBoard();
		board[2][4] = 1; //bloque justo donde caería la parte de abajo de la T girada
		const piece = createPiece("T");

		expect(tryRotate(board, piece)).toBe(piece);
	});
});