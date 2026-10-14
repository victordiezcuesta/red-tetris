import { Player } from "./Player.js";
import { Piece, type PieceType } from "./Piece.js";

export type GameStatus = "waiting" | "playing" | "finished";
export type AddPlayerResult = "ok" | "already_started" | "name_taken";

export type PlayerState = {
	name: string;
	spectrum: number[];
	isAlive: boolean;
	isAdmin: boolean;
};

export type GameState = {
	room: string;
	status: GameStatus;
	players: PlayerState[];
};

const COLS = 10;
const MAX_PIECES_REQUEST = 20;

export class Game
{
	name: string;
	players: Player[];
	admin: Player | null;
	status: GameStatus;
	pieces: Piece[];
	isSolo: boolean;

	constructor(name: string)
	{
		this.name = name;
		this.players = [];
		this.admin = null;
		this.status = "waiting";
		this.pieces = [];
		this.isSolo = false;
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

		this.checkFinished(); // chequeamos si al irse un jugador hay alguno que ya es ganador
	}

	isEmpty(): boolean
	{
		return this.players.length === 0;
	}

	getState(): GameState //estado publico de la partida para no poner publico por ejempllo el id del socket del player
	{
		const players: PlayerState[] = [];
		for (let i = 0; i < this.players.length; i++)
		{
			players.push({
				name: this.players[i].name,
				spectrum: [...this.players[i].spectrum], // copiamos el spectrum
				isAlive: this.players[i].isAlive,
				isAdmin: this.players[i] === this.admin,
			});
		}
		return { room: this.name, status: this.status, players: players };
	}

	start(socketId: string): boolean
	{
		if (this.admin === null || this.admin.socketId !== socketId)
			return false;
		if (this.status === "playing")
			return false;

		for (let i = 0; i < this.players.length; i++)
		{
			this.players[i].reset(); //reseteamos a los players con la funcion de la clase player
		}
		this.pieces = [];
		this.isSolo = this.players.length === 1;
		this.status = "playing";
		return true;
	}

	getPieces(player: Player, n: number): Piece[] //devolvemos la pila de las piezas que es la misma para todos los jugadores pero algunos van consumiendo antes las piezas que otros entonces devolvemos a cada jugador la pieza que le toque pero siguiendo la misma secuencia para todos los players
	{
		const end = player.nextPieceIndex + n;

		while (this.pieces.length < end)
			this.pieces.push(Piece.random());

		const result: Piece[] = [];
		for (let i = player.nextPieceIndex; i < end; i++)
		{
			result.push(this.pieces[i]);
		}

		player.nextPieceIndex = end;
		return result;
	}

	getPieceTypes(socketId: string, n: number): PieceType[] //devuelve un array con el numero expecifico de los tipos de las piezas que pide el cliente al servidor
	{
		if (this.status !== "playing")
			return [];

		const player = this.findPlayer(socketId);
		if (player === undefined)
			return [];

		let count = n;
		if (count < 1)
			count = 1;
		if (count > MAX_PIECES_REQUEST)
			count = MAX_PIECES_REQUEST;

		const pieces = this.getPieces(player, count);
		const types: PieceType[] = [];
		for (let i = 0; i < pieces.length; i++)
		{
			types.push(pieces[i].type);
		}
		return types;
	}

	setSpectrum(socketId: string, spectrum: number[]): void
	{
		const player = this.findPlayer(socketId);
		if (player === undefined)
			return;
		if (spectrum.length !== COLS) //comprobamos si la info del cliente es correcta
			return;

		player.spectrum = spectrum;
	}

	markLost(socketId: string): void
	{
		const player = this.findPlayer(socketId);
		if (player === undefined)
			return;

		player.isAlive = false;
		this.checkFinished();
	}

	getWinner(): Player | null
	{
		if (this.status !== "finished" || this.isSolo)
			return null;

		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].isAlive)
				return this.players[i];
		}
		return null;
	}

	private checkFinished(): void
	{
		if (this.status !== "playing")
			return;

		let alive = 0;
		for (let i = 0; i < this.players.length; i++)
		{
			if (this.players[i].isAlive)
				alive++;
		}

		if (this.isSolo)
		{
			if (alive === 0)
				this.status = "finished";
		}
		else if (alive <= 1) // finalizamos cuando queda un jugador vivo
			this.status = "finished";
	}
}