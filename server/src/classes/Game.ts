import { Piece } from "./Piece.js";
import { Player } from "./Player.js";

export type GameStatus = "waiting" | "playing" | "finished";
export type AddPlayerResult = "ok" | "already_started" | "name_taken";

export class Game
{
	name: string;
	players: Player[];
	admin: Player | null;
	status: GameStatus;
	pieces: Piece[];

	constructor(name: string)
	{
		this.name = name;
		this.players = [];
		this.admin = null;
		this.status = "waiting";
		this.pieces = [];
	}

	findPlayer(socketId: string): Player | undefined //buscamos al jugador por el socketid
	{
		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].socketId === socketId)
				return this.players[i];
		}
		return undefined;
	}

	addPlayer(player: Player): AddPlayerResult
	{
		if (this.status !== "waiting")
			return "already_started";

		for (let i = 0; i < this.players.length; i++) //comprobamos si ya tenemos un player con ese nombre
		{
			if (this.players[i].name === player.name)
				return "name_taken";
		}

		this.players.push(player);
		if (this.admin === null)
			this.admin = player;
		return "ok";
	}

	removePlayer(socketId: string): void
	{
		const remaining: Player[] = []; //creamos un array vacio del tipo player
		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].socketId !== socketId) //vamos rellenando con los demas usuarios que no se han ido
				remaining.push(this.players[i]);
		}
		this.players = remaining; //actualizamos players

		if (this.admin !== null && this.admin.socketId === socketId) //si se va el admin el siguiente usuario se convierte en admin
		{
			if (this.players.length > 0)
				this.admin = this.players[0];
			else
				this.admin = null;
		}
	}

	isEmpty(): boolean
	{
		return this.players.length === 0;
	}
}