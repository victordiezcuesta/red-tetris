import { describe, expect, it } from "vitest";
import { COLS, ROWS, createEmptyBoard } from "../src/game/board";
import { getSpectrum } from "../src/game/spectrum";

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
