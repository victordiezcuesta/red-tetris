import { createSlice } from "@reduxjs/toolkit";
import { createEmptyBoard, type Board } from "../game/board";
import type { Piece, PieceType } from "../game/pieces";

export type GameStatus = "waiting" | "playing" | "lost";

export type GameState = {
	board: Board;
	currentPiece: Piece | null; // la pieza que está cayendo (null si no hay partida)
	pieceQueue: PieceType[]; // tipos de pieza pendientes, mandados por el servidor
	status: GameStatus;
};

export const initialState: GameState = {
	board: createEmptyBoard(),
	currentPiece: null,
	pieceQueue: [],
	status: "waiting",
};

const gameSlice = createSlice({
	name: "game",
	initialState: initialState,
	reducers: {}, //Un reducer recibe el estado actual y devuelve el siguiente
});

export default gameSlice.reducer; //la función que aplica los cambios al estado. Es lo que exportamos para conectarlo al store