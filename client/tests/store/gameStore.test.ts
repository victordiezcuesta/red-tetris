import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyBoard } from "../../src/game/board";
import { SHAPES, createPiece, type PieceType } from "../../src/game/pieces";
import { rotateShape } from "../../src/game/rotation";
import { useGameStore } from "../../src/store/gameStore";

// siempre leemos el estado actual del store
const game = () => useGameStore.getState();

// empieza una partida y recibe piezas (la primera se convierte en la pieza actual)
const startWith = (pieces: PieceType[]) => {
	game().startGame();
	game().receivePieces(pieces);
};

beforeEach(() => { //como el store es global y se comparte entre test con beforeeach lo dejamos en estado inicial antes de cada uno
	useGameStore.setState(useGameStore.getInitialState(), true); //volvemos al estado inicial
});

describe("gameStore", () => {
	it("startGame y receivePieces: la primera pieza recibida pasa a ser la actual", () => {
		startWith(["T", "O"]);

		expect(game().status).toBe("playing");
		expect(game().currentPiece?.type).toBe("T");
		expect(game().pieceQueue).toEqual(["O"]); //la T ya no está en la cola

		game().receivePieces(["I"]); //ya hay pieza actual: solo crece la cola
		expect(game().pieceQueue).toEqual(["O", "I"]);
	});

	it("moveLeft, moveRight, softDrop y rotate mueven la pieza actual", () => {
		startWith(["T"]); //la T empieza en x = 3, y = 0

		game().moveLeft();
		expect(game().currentPiece?.x).toBe(2);

		game().moveRight();
		expect(game().currentPiece?.x).toBe(3);

		game().softDrop();
		expect(game().currentPiece?.y).toBe(1);

		game().rotate();
		expect(game().currentPiece?.shape).toEqual(rotateShape(SHAPES.T));
	});

	it("hardDrop deja la pieza en el suelo y saca la siguiente", () => {
		startWith(["O", "T"]);

		game().hardDrop();

		expect(game().board[19][4]).toBe(2); //la O (valor 2) ocupa las filas 18 y 19, columnas 4 y 5
		expect(game().board[18][5]).toBe(2);
		expect(game().currentPiece?.type).toBe("T");
		expect(game().lastCleared).toBeNull(); //no se ha completado ninguna línea
	});

	it("tick baja la pieza una fila y, si no puede bajar, la fija", () => {
		startWith(["O", "T"]);

		game().tick();
		expect(game().currentPiece?.y).toBe(1);

		useGameStore.setState({ currentPiece: { ...createPiece("O"), y: 18 } }); //la ponemos ya en el suelo
		game().tick();

		expect(game().board[19][4]).toBe(2); //se ha fijado
		expect(game().currentPiece?.type).toBe("T"); //y sale la siguiente
	});

	it("limpia las líneas completas y guarda cuántas ha limpiado", () => {
		startWith(["O", "T"]);

		const board = createEmptyBoard();
		const row = [1, 1, 1, 1, 0, 0, 1, 1, 1, 1]; //fila con hueco en las columnas 4 y 5
		board[18] = [...row];
		board[19] = [...row];
		useGameStore.setState({ board });

		game().hardDrop(); //la O cae justo en el hueco y completa las dos filas

		expect(game().lastCleared).toEqual({ count: 2 });
		expect(game().board).toEqual(createEmptyBoard()); //las dos filas desaparecen
	});

	it("pierde si la nueva pieza no cabe", () => {
		game().startGame();

		const board = createEmptyBoard();
		board[0][4] = 1; //bloque justo donde aparecería la O
		useGameStore.setState({ board });

		game().receivePieces(["O"]);

		expect(game().status).toBe("lost");
		expect(game().currentPiece).toBeNull();
	});

	it("receivePenalty añade filas de penalización y pierde si no hay sitio", () => {
		startWith(["O"]);

		game().receivePenalty(2);
		expect(game().board[19]).toEqual([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
		expect(game().board[18]).toEqual([9, 9, 9, 9, 9, 9, 9, 9, 9, 9]);
		expect(game().status).toBe("playing");

		// pierde si hay un bloque arriba que se saldría del tablero
		startWith(["O"]);
		const board = createEmptyBoard();
		board[0][0] = 1;
		useGameStore.setState({ board });
		game().receivePenalty(1);
		expect(game().status).toBe("lost");

		// pierde si la fila de penalización aplasta a la pieza actual
		startWith(["O"]);
		useGameStore.setState({ currentPiece: { ...createPiece("O"), y: 18 } });
		game().receivePenalty(1);
		expect(game().status).toBe("lost");
	});

	it("las acciones no hacen nada si no se está jugando, y endGame respeta 'lost'", () => {
		// estado inicial: status "waiting"
		game().moveLeft();
		game().moveRight();
		game().rotate();
		game().softDrop();
		game().hardDrop();
		game().tick();
		game().receivePenalty(2);
		game().endGame();

		expect(game().status).toBe("waiting");
		expect(game().currentPiece).toBeNull();
		expect(game().board).toEqual(createEmptyBoard());

		// endGame durante la partida la deja en "finished"
		startWith(["O"]);
		game().endGame();
		expect(game().status).toBe("finished");
		expect(game().currentPiece).toBeNull();

		// pero si ya habíamos perdido, sigue en "lost"
		useGameStore.setState({ status: "lost" });
		game().endGame();
		expect(game().status).toBe("lost");
	});
});