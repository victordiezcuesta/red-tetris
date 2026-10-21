import { describe, expect, it } from "vitest";
import { Game } from "../../src/classes/Game.js";
import { Player } from "../../src/classes/Player.js";

describe("Game", () => {
	it("gestiona los jugadores y el admin de la sala", () => {
		const game = new Game("sala");
		const victor = new Player("victor", "socket1");
		const victor1 = new Player("victor1", "socket2");

		expect(game.addPlayer(victor)).toBe("ok");
		expect(game.addPlayer(victor1)).toBe("ok");
		expect(game.addPlayer(new Player("victor", "s3"))).toBe("name_taken"); //nombre repetido

		expect(game.findPlayer("socket2")).toBe(victor1);
		expect(game.findPlayer("socketNoExiste")).toBeUndefined();

		// el primero en entrar es el admin
		expect(game.getState().players[0].isAdmin).toBe(true);
		expect(game.getState().players[1].isAdmin).toBe(false);

		// si el admin se va, el siguiente jugador pasa a ser admin
		game.removePlayer("socket1");
		expect(game.getState().players[0].name).toBe("victor1");
		expect(game.getState().players[0].isAdmin).toBe(true);

		game.removePlayer("socket2");
		expect(game.isEmpty()).toBe(true);
	});

	it("juega una partida: empezar, piezas, spectrum, penalización y ganador", () => {
		const game = new Game("sala");
		const victor = new Player("victor", "socket1");
		const victor1 = new Player("victor1", "socket2");
		game.addPlayer(victor);
		game.addPlayer(victor1);

		// empezar
		expect(game.start("socket2")).toBe(false); //victor1 no es admin
		expect(game.start("socket1")).toBe(true);
		expect(game.start("socket1")).toBe(false); //ya está en juego
		expect(game.addPlayer(new Player("victor2", "socket3"))).toBe("already_started");

		// los dos jugadores reciben la misma secuencia de piezas
		const piecesVictor = game.getPieceTypes("socket1", 5);
		const piecesVictor1 = game.getPieceTypes("socket2", 5);
		expect(piecesVictor).toHaveLength(5);
		expect(piecesVictor1).toEqual(piecesVictor);
		expect(game.getPieceTypes("socketNoExiste", 5)).toEqual([]);

		// spectrum: uno válido y otro con tamaño incorrecto
		expect(game.setSpectrum("socket1", [0, 0, 2, 0, 1, 0, 1, 1, 2, 5])).toBe(true);
		expect(game.setSpectrum("socket1", [1, 2])).toBe(false);

		// penalización: limpiar 3 líneas manda 2 filas al rival; 1 línea no manda nada
		expect(game.getPenalty("socket1", 3)).toEqual({ count: 2, targets: ["socket2"] });
		expect(game.getPenalty("socket1", 1).count).toBe(0);

		// victor1 pierde: la partida acaba y gana victor
		expect(game.markLost("socket2")).toBe(true);
		expect(game.status).toBe("finished");
		expect(game.getWinner()).toBe(victor);
	});
});