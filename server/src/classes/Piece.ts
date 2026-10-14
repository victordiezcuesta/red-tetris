export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export class Piece
{
	type: PieceType;

	constructor(type: PieceType)
	{
		this.type = type;
	}

	static random(): Piece
	{
		const index = Math.floor(Math.random() * PIECE_TYPES.length);
		return new Piece(PIECE_TYPES[index]);
	}
}