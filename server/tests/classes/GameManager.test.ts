import { describe, expect, it } from "vitest";
import { GameManager } from "../../src/classes/GameManager.js";
import { Player } from "../../src/classes/Player.js";

describe("GameManager", () => {
	it("getOrCreate crea la sala la primera vez y reutiliza la misma después", () => {
		const manager = new GameManager();

		const room1 = manager.getOrCreate("sala");
		const room1_same = manager.getOrCreate("sala"); //ya existe: devuelve la misma

		expect(room1).toBe(room1_same); //toBe comprueba que es exactamente el mismo objeto
		expect(manager.get("sala")).toBe(room1);
		expect(manager.get("sala2")).toBeUndefined();
	});

	it("removeIfEmpty borra la sala solo si no tiene jugadores", () => {
		const manager = new GameManager();

		const game = manager.getOrCreate("sala");
		game.addPlayer(new Player("victor", "socket-1"));

		//testeamos si tiene un jugador: NO se borra
		manager.removeIfEmpty("sala");
		expect(manager.get("sala")).toBe(game);

		// ahora borramos al jugador y testeamos que se borra la sala y devuelve undefined
		game.removePlayer("socket-1");
		manager.removeIfEmpty("sala");
		expect(manager.get("sala")).toBeUndefined();

		// testeamos si la sala no existe no tiene que hacer nada porque game === undefined
		manager.removeIfEmpty("sala_no_creada");
	});
});