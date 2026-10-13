import { create } from "zustand";

import { createEmptyBoard, type Board } from "../game/board";
import type { Piece, PieceType } from "../game/pieces";
import { createPiece } from "../game/pieces";
import { moveLeft as movePieceLeft, moveRight as movePieceRight, moveDown as movePieceDown, tryRotate} from "../game/movement"; //el motor a tiene funciones moveLeft entonces con as le decimos que coja las nuestras
import { dropPieceDown } from "../game/dropPieceDown";
import { mergePiece } from "../game/merge";
import { clearLines } from "../game/lines";
import { hasCollision } from "../game/collision";
import { addPenaltyLines } from "../game/penalty";

export type GameStatus = "waiting" | "playing" | "lost";

export type GameState =
{
	board: Board;
	currentPiece: Piece | null; // la pieza que está cayendo (null si no hay partida)
	pieceQueue: PieceType[]; // tipos de pieza pendientes, mandados por el servidor
	status: GameStatus;
};

type GameActions = {
	moveLeft: () => void;
	moveRight: () => void;
	rotate: () => void;
	softDrop: () => void;
	hardDrop: () => void;
	tick: () => void;
	startGame: () => void;
	receivePieces: (pieces: PieceType[]) => void;
	receivePenalty: (count: number) => void;
};

type GameStore = GameState & GameActions;

const initialState: GameState = {
	board: createEmptyBoard(),
	currentPiece: null,
	pieceQueue: [],
	status: "waiting",
};

/*
 * Calcula la siguiente pieza sin modificar el estado recibido.
 * Devuelve los campos que deben actualizarse en el store.
 */
function getNextPiece(board: Board, pieceQueue: PieceType[]): Pick<GameState, "currentPiece" | "pieceQueue" | "status">
{
	const [nextType, ...remainingPieces] = pieceQueue;

	if (nextType === undefined) //no tenemos nada en la cola
	{
		return {
			currentPiece: null,
			pieceQueue: remainingPieces,
			status: "playing",
		};
	}

	const newPiece = createPiece(nextType);

	if (hasCollision(board, newPiece))  //si la nueva pieza segun se crea choca hemos perdido
	{
		return {
			currentPiece: null,
			pieceQueue: remainingPieces,
			status: "lost",
		};
	}

	return {
		currentPiece: newPiece,
		pieceQueue: remainingPieces,
		status: "playing",
	};
}

export const useGameStore = create<GameStore>()((set) => ({
	...initialState,

	moveLeft: () => set((state) => {
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		return {
			currentPiece: movePieceLeft(state.board, state.currentPiece),
		};
	}),

	moveRight: () => set((state) => {
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		return {
			currentPiece: movePieceRight(state.board, state.currentPiece),
		};
	}),

	rotate: () => set((state) => {
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		return {
			currentPiece: tryRotate(state.board, state.currentPiece),
		};
	}),

	softDrop: () => set((state) => {
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		return {
			currentPiece: movePieceDown(state.board, state.currentPiece),
		};
	}),

	hardDrop: () => set((state) => {
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		return {
			currentPiece: dropPieceDown(state.board, state.currentPiece),
		};
	}),

	tick: () => set((state) => {
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		const piece = state.currentPiece;
		const movedPiece = movePieceDown(state.board, piece);

		if (movedPiece !== piece) {
			return {
				currentPiece: movedPiece,
			};
		}

		const mergedBoard = mergePiece(state.board, piece);
		const result = clearLines(mergedBoard);

		return {
			board: result.board,
			...getNextPiece(result.board, state.pieceQueue),
		};
	}),

	startGame: () => set({
		board: createEmptyBoard(),
		currentPiece: null,
		pieceQueue: [],
		status: "playing",
	}),

	receivePieces: (pieces) => set((state) => {
		const pieceQueue = [...state.pieceQueue, ...pieces];

		if (state.status === "playing" && state.currentPiece === null) {
			return {
				...getNextPiece(state.board, pieceQueue),
			};
		}

		return { pieceQueue };
	}),

	receivePenalty: (count) => set((state) => {
		if (state.status !== "playing")
			return state;

		const board = addPenaltyLines(state.board, count);

		if (
			state.currentPiece !== null
			&& hasCollision(board, state.currentPiece)
		) {
			return {
				board,
				currentPiece: null,
				status: "lost",
			};
		}

		return { board };
	}),
}));