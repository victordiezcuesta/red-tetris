import { describe, expect, it } from "vitest";
import { Player } from "../../src/classes/Player.js";

describe("Player", () => {
	it("empieza vivo, con spectrum a cero y sin piezas consumidas", () => {
		const player = new Player("victor", "socket-1");

		expect(player.name).toBe("victor");
		expect(player.socketId).toBe("socket-1");
		expect(player.isAlive).toBe(true);
		expect(player.spectrum).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		expect(player.nextPieceIndex).toBe(0);
	});

	it("al jugador le simluamos una partida y vuelve a su estado inicial tras el reset", () => {
		const player = new Player("victor", "socket-1");

		player.isAlive = false;
		player.spectrum = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
		player.nextPieceIndex = 12;

		player.reset();

		expect(player.isAlive).toBe(true);
		expect(player.spectrum).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
		expect(player.nextPieceIndex).toBe(0);
	});
});