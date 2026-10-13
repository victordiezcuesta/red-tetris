// client/src/game/collision.ts
import { COLS, ROWS, type Board } from "./board";
import type { Piece } from "./pieces";

export const hasCollision = (board: Board, piece: Piece): boolean => {
	for (let dy = 0; dy < piece.shape.length; dy++)
	{
		for (let dx = 0; dx < piece.shape[dy].length; dx++)
		{
			// 1. Si la celda de la pieza está vacía, no nos interesa
			if (piece.shape[dy][dx] === 0)
				continue;

			// 2. Posición real de este bloque en el tablero
			const x = piece.x + dx;
			const y = piece.y + dy;

			// choque con los lados o con la pila
			if (x < 0 || x >= COLS || y >= ROWS || y >= 0 && board[y][x] !== 0)
				return true;
		}
	}
	return false;
};