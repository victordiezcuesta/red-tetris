import { COLS, type Board } from "./board";

export const getSpectrum = (board: Board): number[] => {
  const spectrum: number[] = [];

  for (let col = 0; col < COLS; col++) {          // para cada columna (0 a 9)
    let height = 0;                                // si no hay nada, altura 0

    for (let row = 0; row < board.length; row++) { // de arriba a abajo
      if (board[row][col] !== 0) {                 // ¿hay un bloque aquí?
        height = board.length - row;               // altura = filas hasta el suelo
        break;                                     // ya lo encontramos, paramos
      }
    }

    spectrum.push(height);                         // guardamos el resultado
  }

  return spectrum;
};