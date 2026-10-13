import type { Board } from "./board";
import type { Piece } from "./pieces";
import { moveDown } from "./movement";

export function dropPieceDown(board: Board, piece: Piece): Piece
{
	let current = piece;
	let next = moveDown(board, current);

	while (next !== current)
	{
		current = next;
		next = moveDown(board, current); //si devolvemos la misma pieza es que ha habido una colision
	}

	return current; //pieza en su posicion final
}