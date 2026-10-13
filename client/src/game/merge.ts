import type { Board } from "./board";
import type { Piece } from "./pieces";

// Copia el tablero fila a fila para no modificar el original.
function copyBoard(board: Board): Board
{
	const copy: Board = [];
	for (let row = 0; row < board.length; row++)
	{
		copy.push([...board[row]]); //[...board[row]] crea una copia de cada fila | si hacemos una copia total al escribir newBoard[y][x] también cambiarías board
	}

	return copy;
}

// Devuelve un tablero nuevo con la pieza fijada.
export function mergePiece(board: Board, piece: Piece): Board
{
	const newBoard = copyBoard(board);

	for (let dy = 0; dy < piece.shape.length; dy++) //dy = fila de la pieza
	{
		for (let dx = 0; dx < piece.shape[dy].length; dx++)
		{
			if (piece.shape[dy][dx] === 0) //solo nos interesa la pieza no la parte de la matriz que no es pieza
				continue;

			const x = piece.x + dx;
			const y = piece.y + dy;

			if (y < 0) // Ignoramos lo que quede por encima del tablero
				continue;

			newBoard[y][x] = piece.shape[dy][dx];
		}
	}

	return newBoard;
}