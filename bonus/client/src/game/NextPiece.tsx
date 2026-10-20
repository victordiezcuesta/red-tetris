import { useGameStore } from "../store/gameStore";
import { SHAPES } from "./pieces";
import { trimShape } from "./nextPiece";
import { CELL_COLORS } from "./GameBoard";
import "./bonus.css";

export function NextPiece()
{
	const status = useGameStore((state) => state.status);
	const nextType = useGameStore((state) =>
		state.pieceQueue.length > 0 ? state.pieceQueue[0] : null, //la siguiente es la primera de la cola
	);

	let shape: number[][] = [];
	if (status === "playing" && nextType !== null)
		shape = trimShape(SHAPES[nextType]);

	return (
		<div className="next-piece">
			<span className="next-piece-label">SIGUIENTE</span>

			<div className="next-piece-box">
				{shape.length > 0 && (
					<div
						className="next-piece-grid"
						style={{ gridTemplateColumns: `repeat(${shape[0].length}, 14px)` }}
					>
						{shape.map((row, y) =>
							row.map((cell, x) => (
								<div
									key={`${y}-${x}`}
									className={`next-piece-cell${cell !== 0 ? " next-piece-cell-filled" : ""}`}
									style={cell !== 0 ? { backgroundColor: CELL_COLORS[cell] ?? "#ffffff" } : undefined}
								/>
							)),
						)}
					</div>
				)}
			</div>
		</div>
	);
}