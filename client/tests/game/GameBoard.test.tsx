import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { createEmptyBoard } from "../../src/game/board";
import { createPiece } from "../../src/game/pieces";
import { GameBoard } from "../../src/game/GameBoard";

describe("GameBoard", () => {
	it("pinta 200 celdas y ninguna rellena si el tablero está vacío y no hay pieza", () => {
		const { container } = render(<GameBoard board={createEmptyBoard()} currentPiece={null} />);

		expect(container.querySelectorAll(".game-cell")).toHaveLength(200); //10 x 20
		expect(container.querySelectorAll(".game-cell-filled")).toHaveLength(0);
	});

	it("pinta las 4 celdas de la pieza actual", () => {
		const { container } = render(<GameBoard board={createEmptyBoard()} currentPiece={createPiece("O")} />);

		expect(container.querySelectorAll(".game-cell-filled")).toHaveLength(4); //buscas elementos por su clase CSS y los cuentas y devuelve 4 porque estamos con la pieza O
	});

	it("no pinta la parte de la pieza que queda fuera del tablero", () => {
		const piece = { ...createPiece("T"), y: -1 }; //su primera fila queda por encima
		const { container } = render(<GameBoard board={createEmptyBoard()} currentPiece={piece} />);

		expect(container.querySelectorAll(".game-cell-filled")).toHaveLength(3); //de 4 celdas solo se ven 3
	});
});