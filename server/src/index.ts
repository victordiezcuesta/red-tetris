import express from "express"; //libreria de node con la que vamos a atender las peticiones que llegan del cliente como puede ser crea una sala o eliminala entre otras cosas
import { createServer } from "node:http"; 
import { Server } from "socket.io";

import { GameManager } from "./classes/GameManager.js";
import { Player } from "./classes/Player.js";
import { isValidName } from "./utils/validate.js";

const PORT = Number(process.env.PORT ?? 3000);

const app = express(); //app sera el comunicador entre el cliente y el servidor de las peticiones
const httpServer = createServer(app); //Crea un servidor HTTP de Node.js y configura app como la función que procesará las peticiones HTTP recibidas
const io = new Server(httpServer, { cors: { origin: "*" } }); //creamos un servidor de Socket.IO asociado a tu servidor HTTP | cors es que intercambio de recursos entre distintos orígenes porque tenemos el back y el front en distionts puertos
const gameManager = new GameManager(); // todas las partidas

const INITIAL_PIECES = 10;
const PIECES_BATCH = 5; //piezas por defecto cuando el cliente pide más

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

	socket.on("disconnect", () => {
		console.log(`Cliente desconectado: ${socket.id}`);

		const room = socket.data.room;

		if (typeof room !== "string")
			return;

		const game = gameManager.get(room);
		if (game === undefined)
			return;

		game.removePlayer(socket.id);

		io.to(room).emit("state", game.getState());

		gameManager.removeIfEmpty(room);
	});

});

httpServer.listen(PORT, () => {
	console.log(`Servidor escuchando en el puerto ${PORT}`);
});