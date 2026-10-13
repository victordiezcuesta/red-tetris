import { createSlice } from "@reduxjs/toolkit";

import { createEmptyBoard, type Board } from "../game/board";
import type { Piece, PieceType } from "../game/pieces";
import {moveLeft as movePieceLeft, moveRight as movePieceRight, moveDown as movePieceDown, tryRotate} from "../game/movement"; //el motor a tiene funciones moveLeft entonces con as le decimos que coja las nuestras
import { dropPieceDown } from "../game/dropPieceDown";
import { createPiece } from "../game/pieces";
import { mergePiece } from "../game/merge";
import { clearLines } from "../game/lines";
import { hasCollision } from "../game/collision";

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

		tick(state) //es como un latido del juego: cada cierto tiempo se despacha tick y la pieza baja una fila
		{
			if (state.status !== "playing" || state.currentPiece === null)
				return;

			const piece = state.currentPiece;
			const movedPiece = movePieceDown(state.board, piece);
			if (movedPiece !== piece)
			{
				state.currentPiece = movedPiece; //si la pieza bajar, la movemos y ya
				return;
			}

			const mergedBoard = mergePiece(state.board, piece);
			const result = clearLines(mergedBoard);
			state.board = result.board;

			const nextType = state.pieceQueue.shift(); //shift quita el primer elemento del array de la cola de piezas y devuelve el tipo que es
			if (nextType === undefined) //no tenemos nada en la cola
			{
				state.currentPiece = null;
				return;
			}

			const newPiece = createPiece(nextType);
			if (hasCollision(state.board, newPiece)) //si la nueva pieza segun se crea choca hemos perdido
			{
				state.currentPiece = null;
				state.status = "lost";
				return;
			}

			state.currentPiece = newPiece;
		},
	},
});


export const { moveLeft, moveRight, rotate, softDrop, hardDrop, tick } = gameSlice.actions;

export default gameSlice.reducer; //la función que aplica los cambios al estado. Es lo que exportamos para conectarlo al store