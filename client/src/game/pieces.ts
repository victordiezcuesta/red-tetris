import { COLS } from "./board";

export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type Forma = number[][];

export type Piece = {
  type: PieceType;
  forma: Forma;
  x: number;
  y: number;
};

export const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

export const FORMAS: Record<PieceType, Forma> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  T: [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ],
  S: [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ],
  Z: [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ],
  J: [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ],
};

export const createPiece = (type: PieceType): Piece => ({
  type,
  forma: FORMAS[type],
  x: Math.floor((COLS - FORMAS[type][0].length) / 2),
  y: 0,
});
