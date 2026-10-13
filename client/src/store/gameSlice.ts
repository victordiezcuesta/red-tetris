import { createSlice } from "@reduxjs/toolkit";

import { createEmptyBoard, type Board } from "../game/board";
import type { Piece, PieceType } from "../game/pieces";
import {moveLeft as movePieceLeft, moveRight as movePieceRight, moveDown as movePieceDown, tryRotate} from "../game/movement"; //el motor a tiene funciones moveLeft entonces con as le decimos que coja las nuestras
import { dropPieceDown } from "../game/dropPieceDown";

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
	reducers: //Un reducer recibe el estado actual y devuelve el siguiente
	{
		moveLeft(state)
		{
			if (state.status !== "playing" || state.currentPiece === null)
				return;
			state.currentPiece = movePieceLeft(state.board, state.currentPiece);
		},

		moveRight(state)
		{
			if (state.status !== "playing" || state.currentPiece === null)
				return;
			state.currentPiece = movePieceRight(state.board, state.currentPiece);
		},

		rotate(state)
		{
			if (state.status !== "playing" || state.currentPiece === null)
				return;
			state.currentPiece = tryRotate(state.board, state.currentPiece);
		},

		softDrop(state)
		{
			if (state.status !== "playing" || state.currentPiece === null)
				return;
			state.currentPiece = movePieceDown(state.board, state.currentPiece);
		},

		hardDrop(state)
		{
			if (state.status !== "playing" || state.currentPiece === null)
				return;
			state.currentPiece = dropPieceDown(state.board, state.currentPiece);
		},
	},
});


export const { moveLeft, moveRight, rotate, softDrop, hardDrop } = gameSlice.actions;

export default gameSlice.reducer; //la función que aplica los cambios al estado. Es lo que exportamos para conectarlo al store