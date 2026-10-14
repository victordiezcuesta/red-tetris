import { Game } from "./Game.js";

export class GameManager
{
	games: Map<string, Game>; // nombre de sala -> partida

	constructor()
	{
		this.games = new Map<string, Game>();
	}

	getOrCreate(name: string): Game // Devuelve la partida de esa sala; si no existe, la crea
	{
		const existing = this.games.get(name);
		if (existing !== undefined)
			return existing;

		const game = new Game(name);
		this.games.set(name, game);
		return game;
	}

	get(name: string): Game | undefined
	{
		return this.games.get(name);
	}

	removeIfEmpty(name: string): void
	{
		const game = this.games.get(name);
		if (game !== undefined && game.isEmpty())
			this.games.delete(name); //si la sala esta vacia la eliminamos del map
	}
}