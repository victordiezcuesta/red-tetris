import { COLS, ROWS, type Board } from "./board";
import type { Piece } from "./pieces";

type GameBoardProps = {
	board: Board;
	currentPiece: Piece | null;
};

const CELL_COLORS: Record<number, string> = {
	1: "#4dd0d8",
	2: "#f5c84c",
	3: "#b48cf2",
	4: "#6fd49a",
	5: "#f27070",
	6: "#6f90f5",
	7: "#f59a4d",
	9: "#4a4d54",
};

export function GameBoard({ board, currentPiece }: GameBoardProps)
{
	const visibleBoard = board.map((row) => [...row]); //En lugar de modificar el tablero real, creamos una copia de cada fila

	if (currentPiece !== null)
	{
		for (let dy = 0; dy < currentPiece.shape.length; dy++)
		{
			for (let dx = 0; dx < currentPiece.shape[dy].length; dx++)
			{
				if (currentPiece.shape[dy][dx] === 0)
					continue;

				const x = currentPiece.x + dx;
				const y = currentPiece.y + dy;

				// Las partes que quedan fuera del tablero no se dibujan.
				if (x < 0 || x >= COLS || y < 0 || y >= ROWS)
					continue;

				visibleBoard[y][x] = currentPiece.shape[dy][dx];
			}
		}
	}

	return (
		<div className="board-frame">
			<span className="corner corner-tl" />
			<span className="corner corner-tr" />
			<span className="corner corner-bl" />
			<span className="corner corner-br" />

			<div
				className="game-board"
				role="img"
				aria-label="Tablero de Tetris de 10 columnas y 20 filas"
			>
				{visibleBoard.map((row, y) =>
					row.map((cell, x) => (
						<div
							key={`${y}-${x}`}
							className={`game-cell${cell !== 0 ? " game-cell-filled" : ""}`}
							style={{
								backgroundColor: cell === 0
									? undefined
									: CELL_COLORS[cell] ?? "#ffffff",
							}}
						/>
					)),
				)}
			</div>
		</div>
	);
}