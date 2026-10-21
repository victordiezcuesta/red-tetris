import { describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { addPenaltyLines, getPenaltyCount, hasRowOverflow } from "../../src/game/penalty";

describe("getPenaltyCount", () => {
	it("el rival recibe n - 1 filas, y ninguna si limpias 0 o 1", () => {
		expect(getPenaltyCount(0)).toBe(0);
		expect(getPenaltyCount(1)).toBe(0);
		expect(getPenaltyCount(2)).toBe(1);
		expect(getPenaltyCount(4)).toBe(3);
	});
});

describe("hasRowOverflow", () => {
	it("detecta si las filas de arriba que van a desaparecer tienen bloques", () => {
		const board = createEmptyBoard();

		expect(hasRowOverflow(board, 2)).toBe(false); //tablero vacío: no hay desbordamiento

		board[0][5] = 1; //un bloque en la fila de más arriba
		expect(hasRowOverflow(board, 1)).toBe(true); //la fila 0 se perdería
		expect(hasRowOverflow(board, 0)).toBe(false); //no hay penalización: no se pierde nada

		board[0][5] = 0;
		board[1][5] = 1; //ahora el bloque está en la fila 1
		expect(hasRowOverflow(board, 1)).toBe(false); //con 1 fila de penalización solo se pierde la fila 0
	});

	it("ajusta el número de filas si es negativo o mayor que el tablero", () => {
		const board = createEmptyBoard();
		board[19][0] = 1; //un bloque en la última fila

		expect(hasRowOverflow(board, -3)).toBe(false); //se trata como 0
		expect(hasRowOverflow(board, 50)).toBe(true); //se trata como 20: se revisan todas las filas
	});
});

describe("addPenaltyLines", () => {
	it("añade filas de 9 abajo y sube el resto, sin modificar el original", () => {
		const board = createEmptyBoard();
		board[19][0] = 1; //un bloque en el suelo

		const result = addPenaltyLines(board, 2);

		expect(result).toHaveLength(20); //sigue teniendo 20 filas
		expect(result[19]).toEqual([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]); //dos filas de penalización abajo
		expect(result[18]).toEqual([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
		expect(result[17][0]).toBe(1); //el bloque ha subido dos filas
		expect(board[19][0]).toBe(1); //el tablero original no ha cambiado
	});

	it("ajusta el número de filas si es negativo o mayor que el tablero", () => {
		const board = createEmptyBoard();

		expect(addPenaltyLines(board, -1)).toEqual(board); //se trata como 0: nada cambia
		expect(addPenaltyLines(board, 50)[0]).toEqual([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]); //se trata como 20: todo es penalización
	});
});