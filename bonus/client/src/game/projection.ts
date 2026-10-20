import { COLS, ROWS, createEmptyBoard, type Board } from "./board";
import type { Piece } from "./pieces";
import { dropPieceDown } from "./dropPieceDown";

// Devuelve una matriz del tamaño del tablero con las celdas donde caería la pieza
// (en cada celda el valor de la pieza, y 0 en el resto)
export function getProjectionCells(board: Board, piece: Piece): Board
{
	const projection = dropPieceDown(board, piece); //pieza en su posicion final
	const cells = createEmptyBoard();

	for (let dy = 0; dy < projection.shape.length; dy++)
	{
		for (let dx = 0; dx < projection.shape[dy].length; dx++)
		{
			if (projection.shape[dy][dx] === 0)
				continue;

			const x = projection.x + dx;
			const y = projection.y + dy;

			if (x < 0 || x >= COLS || y < 0 || y >= ROWS)
				continue;

			cells[y][x] = projection.shape[dy][dx];
		}
	}

	return cells;
}