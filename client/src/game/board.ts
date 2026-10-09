export const ROWS = 20;
export const COLS = 10;

export type Board = number[][];

export const createEmptyBoard = (): Board =>
  Array.from({ length: ROWS }, () => Array<number>(COLS).fill(0)); //se ejecuta una vez por fila, cada fila es un array distinto lleno de 0
