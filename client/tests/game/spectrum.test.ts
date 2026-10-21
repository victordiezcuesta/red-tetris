import { describe, expect, it } from "vitest";
import { COLS, ROWS, createEmptyBoard } from "../../src/game/board";
import { getBarHeightPercent, getMaxHeight, getOpponents, getSpectrum, isAdminPlayer } from "../../src/game/spectrum";
import type { PlayerState } from "../../src/socket/events";

describe("createEmptyBoard", () => {
	it("creates a 20x10 board filled with zeros", () => {
		const board = createEmptyBoard();
		expect(board).toHaveLength(ROWS);
		expect(board.every((row) => row.length === COLS)).toBe(true); //every comprueba que todos los elementos cumplen una condición
		expect(board.flat().every((cell) => cell === 0)).toBe(true); //flat junta los arrays de board(filas,columnas) en un solo array
	});
});

describe("getSpectrum", () => {
	it("returns all zeros for an empty board", () => {
		expect(getSpectrum(createEmptyBoard())).toEqual(Array(COLS).fill(0));
	});

	it("returns the height of the highest block per column, ignoring holes", () => {
		const bottom = [
			"..#.......",
			"..#..#....",
			"#.##.#....",
			"####.##...",
		];
		// creamos board con las primeras 16 filas vacias(...createEmptyBoard) y las 4 ultimas(...bottom.map) con la estructura de bottom
		const board = [
			...createEmptyBoard().slice(0, ROWS - bottom.length), //slice devuelve una copia de un trozo del array, desde inicio hasta fin (sin incluir fin). El original no cambia.
			...bottom.map((row) => [...row].map((c) => (c === "#" ? 1 : 0))), //[...row] separa bottom en caracteres, cada una posicion del array de la fila | cambiamos los . por 0 y # por 1
		];
		/*RESULTADO const board = [
			[0,0,0,0,0,0,0,0,0,0],   // fila 0  (vacía)
			...                      // hasta la fila 15
			[0,0,1,0,0,0,0,0,0,0],   // fila 16
			[0,0,1,0,0,1,0,0,0,0],   // fila 17
			[1,0,1,1,0,1,0,0,0,0],   // fila 18
			[1,1,1,1,0,1,1,0,0,0],   // fila 19
		];*/
		expect(getSpectrum(board)).toEqual([2, 1, 4, 2, 0, 3, 1, 0, 0, 0]);
	});
});

// función auxiliar para no repetir el objeto entero en cada jugador
const makePlayer = (name: string, isAdmin: boolean): PlayerState => ({
	name: name,
	spectrum: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	isAlive: true,
	isAdmin: isAdmin,
});

describe("getBarHeightPercent", () => {
	it("convierte la altura en porcentaje del tablero", () => {
		expect(getBarHeightPercent(10)).toBe(50); //10 de 20 filas = 50%
	});

	it("no pasa de 0% ni de 100%", () => {
		expect(getBarHeightPercent(0)).toBe(0);
		expect(getBarHeightPercent(-3)).toBe(0);
		expect(getBarHeightPercent(ROWS)).toBe(100);
		expect(getBarHeightPercent(ROWS + 5)).toBe(100);
	});
});

describe("getMaxHeight", () => {
	it("devuelve la altura de la columna más alta", () => {
		expect(getMaxHeight([2, 1, 4, 2, 0, 3, 1, 0, 0, 0])).toBe(4);
	});

	it("devuelve 0 si todas las columnas están vacías", () => {
		expect(getMaxHeight([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toBe(0);
	});
});

describe("getOpponents", () => {
	it("devuelve todos los jugadores menos nosotros", () => {
		const players = [makePlayer("victor", true), makePlayer("victor1", false), makePlayer("victor2", false)];

		const opponents = getOpponents(players, "victor");

		expect(opponents).toHaveLength(2);
		expect(opponents[0].name).toBe("victor1");
		expect(opponents[1].name).toBe("victor2");
	});
});

describe("isAdminPlayer", () => {
	it("devuelve true solo si el jugador existe y es el anfitrión", () => {
		const players = [makePlayer("victor", true), makePlayer("victor1", false)];

		expect(isAdminPlayer(players, "victor")).toBe(true);
		expect(isAdminPlayer(players, "victor1")).toBe(false); //existe pero no es admin
		expect(isAdminPlayer(players, "nadie")).toBe(false); //no existe
	});
});