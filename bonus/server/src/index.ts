import express from "express"; //libreria de node con la que vamos a atender las peticiones que llegan del cliente(navegador). Lo que va a hacer al final es hacer que el servidor del cliente deje de existir y solo exista el servidor del back
import { createServer } from "node:http"; 
import { Server } from "socket.io";
import { join } from "node:path";

import { GameManager } from "./classes/GameManager.js";
import { Player } from "./classes/Player.js";
import { isValidName, isValidMessage } from "./utils/validate.js";
import { Leaderboard } from "./classes/Leaderboard.js";
import { getLinePoints } from "./utils/score.js";

import type { Game } from "./classes/Game.js"; //importamos solo el tipo no ninguna variable ni funcion

const PORT = Number(process.env.PORT ?? 3000);

const app = express(); //app sera el comunicador entre el cliente y el servidor de las peticiones
const CLIENT_DIST = join(import.meta.dirname, "../../client/dist"); //import.meta.dirname es la carpeta donde está el archivo actual
/*Primero express.static: si la URL es un archivo real (/bundle.js), lo devuelve y termina
Si no lo es, pasa al app.get("/{*splat}"), que devuelve index.html()*/
app.use(express.static(CLIENT_DIST)); // CLIENT_DIST: client/dist | si llega una petición como /bundle.js, busca ese archivo dentro de client/dist y lo devuelve. Para / devuelve index.html automáticamente.
app.get("/{*splat}", (_req, res) => { //app.get("/{*splat}" para cualquier URL con método GET | _req tiene el guion bajo para que typescript no se queje de parametros sin usar
	res.sendFile(join(CLIENT_DIST, "index.html")); //responde con el contenido de ese archivo. Necesita una ruta absoluta, y la nuestra lo es porque CLIENT_DIST parte de import.meta.dirname
});

const httpServer = createServer(app); //Crea un servidor HTTP de Node.js y configura app como la función que procesará las peticiones HTTP recibidas
const io = new Server(httpServer, { cors: { origin: "*" } }); //creamos un servidor de Socket.IO asociado a tu servidor HTTP | cors es que intercambio de recursos entre distintos orígenes porque tenemos el back y el front en distionts puertos
const gameManager = new GameManager(); // todas las partidas
const leaderboard = new Leaderboard(); //top 3 de todas las salas
const scores = new Map<string, number>(); //Guarda los puntos de cada jugador en la partida actual, indexados por socket.id

const INITIAL_PIECES = 10;
const PIECES_BATCH = 5; //piezas por defecto cuando el cliente pide más

// Pasa el score del jugador al top 3 y lo borra del Map (así no se registra dos veces)
function recordScore(room: string, name: string, socketId: string): void
{
	const score = scores.get(socketId);
	scores.delete(socketId);

	if (score === undefined || score === 0)
		return;

	if (leaderboard.add({ name: name, room: room, score: score }))
		io.emit("topScores", leaderboard.getTop()); //a todos los clientes de todas las salas
}

function emitGameOver(room: string, game: Game): void
{
	for (let i = 0; i < game.players.length; i++)
	{
		recordScore(room, game.players[i].name, game.players[i].socketId);
	}

	const winner = game.getWinner();
	io.to(room).emit("gameOver", { winner: winner === null ? null : winner.name });
}

io.on("connection", (socket) => { //.on es un metodo que sirve para escuchar un evento(que en este caso es el de conexion de un cliente con el servidor) y ejecutar una funcion | socket es objeto que representa una conexión concreta con un cliente
	console.log(`Cliente conectado: ${socket.id}`);

	socket.on("join", (data: { room?: unknown; name?: unknown }) => {
		
		if (socket.data.room !== undefined) //si ya esta en la sala lo ignoramos
			return;

		if (typeof data?.room !== "string" || typeof data?.name !== "string")
		{
			socket.emit("joinError", "invalid_name");
			return;
		}
		if (!isValidName(data.room) || !isValidName(data.name))
		{
			socket.emit("joinError", "invalid_name");
			return;
		}

		const game = gameManager.getOrCreate(data.room);

		const result = game.addPlayer(new Player(data.name, socket.id));
		if (result !== "ok")
		{
			gameManager.removeIfEmpty(data.room);
			socket.emit("joinError", result);
			return;
		}

		socket.data.room = data.room; //actualizamos la sala en el socket
		socket.join(data.room); //enlaza cada socket de cada jugador en una sola sala
		socket.emit("joined", { room: data.room, name: data.name }); // enviamos al cliente mediante el socket del jugador que se ha unido a una partida con un nombre
		socket.emit("topScores", leaderboard.getTop()); //el que entra ve el top actual
		io.to(data.room).emit("state", game.getState()); //enviamos a todos los sockets de la partida el estado del juego
	});

	socket.on("start", () => {
		const room = socket.data.room;
		if (typeof room !== "string")
		{
			socket.emit("startError", "not_in_room");
			return;
		}

		const game = gameManager.get(room);
		if (game === undefined)
		{
			socket.emit("startError", "game_not_found");
			return;
		}

		if (!game.start(socket.id))
		{
			socket.emit("startError", "cannot_start");
			return;
		}

		for (let i = 0; i < game.players.length; i++)
		{
			const player = game.players[i];
			scores.set(player.socketId, 0); //todos empiezan la partida con 0 puntos
			io.to(player.socketId).emit("pieces", game.getPieceTypes(player.socketId, INITIAL_PIECES)); //enviamos las piezas iniciales a todos los jugadores
		}

		io.to(room).emit("state", game.getState());
	});

	socket.on("needPieces", (count?: unknown) => {
		const room = socket.data.room;
		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		let n = PIECES_BATCH;
		if (typeof count === "number" && Number.isInteger(count)) //si el cliente manda un entero válido lo usamos
			n = count;

		const types = game.getPieceTypes(socket.id, n);
		if (types.length === 0)
			return;

		socket.emit("pieces", types); //solo a este jugador
	});

	socket.on("linesCleared", (cleared: unknown) => {
		const room = socket.data.room;
		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		if (typeof cleared !== "number")
			return;

		const scorer = game.findPlayer(socket.id);
		if (scorer !== undefined && scorer.isAlive && game.status === "playing") //Solo sumamos puntos si el jugador existe, está vivo y la partida está en juego
			scores.set(socket.id, (scores.get(socket.id) ?? 0) + getLinePoints(cleared));

		const penalty = game.getPenalty(socket.id, cleared);
		for (let i = 0; i < penalty.targets.length; i++)
		{
			io.to(penalty.targets[i]).emit("penalty", penalty.count); //solo a cada rival
		}
	});

	socket.on("spectrum", (data: unknown) => {
		const room = socket.data.room;
		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		if (!Array.isArray(data)) //comprobacion delo que envia el cliente
			return;

		if (!game.setSpectrum(socket.id, data))
			return;

		io.to(room).emit("state", game.getState()); //todos ven el spectrum actualizado
	});

	socket.on("chat", (text: unknown) => {
		const room = socket.data.room;
		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		const player = game.findPlayer(socket.id); //el nombre lo ponemos nosotros, no lo manda el cliente
		if (player === undefined)
			return;

		if (typeof text !== "string" || !isValidMessage(text))
			return;

		io.to(room).emit("chat", { name: player.name, text: text.trim() }); //solo a los de la sala
	});

	socket.on("lost", () => {
		const room = socket.data.room;
		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		if (!game.markLost(socket.id))
			return;

		const loser = game.findPlayer(socket.id);
		if (loser !== undefined)
			recordScore(room, loser.name, socket.id);

		io.to(room).emit("state", game.getState());
		if (game.status === "finished")
			emitGameOver(room, game);
	});

	socket.on("disconnect", () => {
		const room = socket.data.room;
		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		const wasPlaying = game.status === "playing"; //lo guardamos antes de quitar al jugador

		const leaving = game.findPlayer(socket.id);
		if (leaving !== undefined)
			recordScore(room, leaving.name, socket.id); //guardamos el score del jugador antes de eleminarlo despues del que cliente cierre la pestaña

		game.removePlayer(socket.id);

		io.to(room).emit("state", game.getState());
		if (wasPlaying && game.status === "finished")
			emitGameOver(room, game);

		gameManager.removeIfEmpty(room);
	});

});

httpServer.listen(PORT, () => {
	console.log(`Servidor escuchando en el puerto ${PORT}`);
});