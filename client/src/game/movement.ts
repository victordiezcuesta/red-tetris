import type { Board } from "./board";
import type { Piece } from "./pieces";
import { hasCollision } from "./collision";
import { rotatePiece } from "./rotation";

function tryMove(board: Board, piece: Piece, dx: number, dy: number): Piece
{
	const movedPiece: Piece = {
		type: piece.type,
		shape: piece.shape,
		x: piece.x + dx,
		y: piece.y + dy,
	};

	if (hasCollision(board, movedPiece)) //si tenemos una colision devolvemos la pieza original no la nueva con la nueva posicion
		return piece;
	return movedPiece;
}

export function moveLeft(board: Board, piece: Piece): Piece
{
	return tryMove(board, piece, -1, 0);
}

export function moveRight(board: Board, piece: Piece): Piece
{
	return tryMove(board, piece, 1, 0);
}

export function moveDown(board: Board, piece: Piece): Piece
{
	return tryMove(board, piece, 0, 1);
}

export function tryRotate(board: Board, piece: Piece): Piece
{
	const rotatedPiece = rotatePiece(piece);

	if (hasCollision(board, rotatedPiece)) //si tenemos una colision devolvemos la pieza original no la nueva con la nueva rotacion
		return piece;
	return rotatedPiece;
}