import { describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { clearLines } from "../../src/game/lines";

const makeFullRow = (): number[] => [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

describe("clearLines", () => {
	it("elimina las filas completas y baja lo que había encima", () => {
		const board = createEmptyBoard();
		board[19] = makeFullRow(); //dos filas completas abajo del todo
		board[18] = makeFullRow();
		board[17][0] = 2; //un bloque suelto encima de ellas

		const result = clearLines(board);

		expect(result.rowsCleared).toBe(2);
		expect(result.board).toHaveLength(20);
		expect(result.board[19][0]).toBe(2); //el bloque suelto ha bajado hasta el suelo
		expect(result.board[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); //arriba hay filas vacías nuevas
		expect(board[19]).toEqual(makeFullRow()); //el tablero original no ha cambiado
	});

	it("no elimina filas con huecos ni filas de penalización", () => {
		const board = createEmptyBoard();
		board[19] = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1];
		board[18] = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9];

		const result = clearLines(board);

		expect(result.rowsCleared).toBe(0);
		expect(result.board).toEqual(board);
	});
});