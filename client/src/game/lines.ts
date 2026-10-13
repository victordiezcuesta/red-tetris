import { COLS, PENALTY_CELL, type Board } from "./board";

// Una fila está completa si todas sus casillas tienen bloque
// y ninguna es de penalización.
function isRowComplete(row: number[]): boolean {
  for (let col = 0; col < row.length; col++) {
    if (row[col] === 0) return false;             // hay un hueco
    if (row[col] === PENALTY_CELL) return false;  // fila indestructible
  }
  return true;
}

// Crea una fila vacía (10 ceros).
function createEmptyRow(): number[] {
  const row: number[] = [];

  for (let col = 0; col < COLS; col++) {
    row.push(0);
  }
  return row;
}

// Elimina las filas completas y devuelve el tablero nuevo
// junto con el número de filas eliminadas.
export function clearLines(board: Board): { board: Board; cleared: number } {
  const keptRows: number[][] = [];
  let cleared = 0;

  // 1. Nos quedamos solo con las filas que NO están completas
  for (let row = 0; row < board.length; row++) {
    if (isRowComplete(board[row])) {
      cleared++;
    } else {
      keptRows.push([...board[row]]);
    }
  }

  // 2. Añadimos tantas filas vacías arriba como filas hemos borrado
  const newBoard: Board = [];

  for (let i = 0; i < cleared; i++) {
    newBoard.push(createEmptyRow());
  }
  for (let i = 0; i < keptRows.length; i++) {
    newBoard.push(keptRows[i]);
  }

  return { board: newBoard, cleared: cleared };
}