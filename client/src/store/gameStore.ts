import { create } from "zustand"; //zustand es una biblioteca para la gestión del estado global en aplicaciones Reac

import { createEmptyBoard, type Board } from "../game/board";
import type { Piece, PieceType } from "../game/pieces";
import { createPiece } from "../game/pieces";
import { moveLeft as movePieceLeft, moveRight as movePieceRight, moveDown as movePieceDown, tryRotate} from "../game/movement"; //el motor a tiene funciones moveLeft entonces con as le decimos que coja las nuestras
import { dropPieceDown } from "../game/dropPieceDown";
import { mergePiece } from "../game/merge";
import { clearLines } from "../game/lines";
import { hasCollision } from "../game/collision";
import { addPenaltyLines } from "../game/penalty";

import { socket } from "../socket/socket";

export type GameStatus = "waiting" | "playing" | "lost" | "finished";

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
	endGame: () => void;
};

type GameStore = GameState & GameActions;

const initialState: GameState = {
	board: createEmptyBoard(),
	currentPiece: null,
	pieceQueue: [],
	status: "waiting",
};

function getNextPiece(board: Board, pieceQueue: PieceType[]): Pick<GameState, "currentPiece" | "pieceQueue" | "status"> //Pick es un tipo de utilidad que sirve para seleccionar algunas propiedas de un tipo para no tener que devolver todas cuando no nos interesa
{
	const [nextType, ...remainingPieces] = pieceQueue; //guardamos en nextType el siguiente tipo de pieza que toca, y en remainingPieces el resto de piezas quitando la que hemos quitado de la cola

	if (nextType === undefined) //no tenemos nada en la cola
	{
		return {
			currentPiece: null,
			pieceQueue: remainingPieces,
			status: "playing",
		};
	}

	const newPiece = createPiece(nextType);
	if (hasCollision(board, newPiece)) //si la nueva pieza segun se crea choca hemos perdido
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

//es un hook que Zustand crea para que tus componentes puedan acceder al estado compartido de la partida
export const useGameStore = create<GameStore>()((set) => ({ //create<GameStore>() es una función de Zustand que sirve para crear un store (almacén de estado) del tipo GameStore
	...initialState, //copiamos los valores de initialState a useGameStore junto con el set

	moveLeft: () => set((state) => { //set actualiza el estado de GameStore, si devolvemos lo mismo es que no podemos mover la pieza y si modificamos algo solo devolvemos lo que modificamos
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

		const piece = dropPieceDown(state.board, state.currentPiece);

		//mergeamos la pieza y si completamos una fila la limpiamos
		const mergedBoard = mergePiece(state.board, piece);
		const result = clearLines(mergedBoard);

		if (result.rowsCleared > 0)
			socket.emit("linesCleared", result.rowsCleared);

		return {
			board: result.board,
			...getNextPiece(result.board, state.pieceQueue),
		};
	}),

	tick: () => set((state) => { //cada vez que se ejecuta, intenta hacer bajar la pieza actual una fila
		if (state.status !== "playing" || state.currentPiece === null)
			return state;

		const piece = state.currentPiece;
		const movedPiece = movePieceDown(state.board, piece);

		if (movedPiece !== piece) //puede bajar y devuelve la nueva posición de la pieza
		{
			return {
				currentPiece: movedPiece,
			};
		}
		//mergeamos la pieza y si completamos una fila la limpiamos
		const mergedBoard = mergePiece(state.board, piece);
		const result = clearLines(mergedBoard);

		if (result.rowsCleared > 0)
			socket.emit("linesCleared", result.rowsCleared);

		return {
			board: result.board,
			...getNextPiece(result.board, state.pieceQueue), ///añadimos las demas propiedades con la funcion auxiliar getNextPiece 
		};
	}),

	startGame: () => set({
		board: createEmptyBoard(),
		currentPiece: null,
		pieceQueue: [],
		status: "playing",
	}),

	receivePieces: (pieces) => set((state) => { //recibimos (pieces) que envía el servidor y las añadimos a la cola de piezas
		const pieceQueue = [...state.pieceQueue, ...pieces]; //juntamos las piezas que ya tenemos con las que nos acaba de mandar el servidor

		if (state.status === "playing" && state.currentPiece === null)
		{
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
		if (state.currentPiece !== null && hasCollision(board, state.currentPiece))
		{
			return {
				board,
				currentPiece: null,
				status: "lost",
			};
		}

		return { board };
	}),

	endGame: () => set((state) => {
		if (state.status !== "playing") //si ya habíamos perdido nos quedamos en "lost"
			return state;

		return {
			currentPiece: null,
			status: "finished",
		};
	}),
}));