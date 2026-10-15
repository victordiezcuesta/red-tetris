import { useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import { socket } from "./socket/socket";
import type { JoinError, RoomState } from "./socket/events";

import { useGameStore } from "./store/gameStore";
import type { PieceType } from "./game/pieces";


type ConnectionStatus = "connecting" | "joined" | "error";

function getJoinErrorMessage(error: JoinError): string
{
	switch (error)
	{
		case "invalid_name":
			return "The room or the player's name is invalid.";
		case "already_started":
			return "The game has already begun. You cannot enter.";
		case "name_taken":
			return "There is already a player with that name in the room.";
	}
}

function RoomPage()
{
	const { room, playerName } = useParams<{
		room: string;
		playerName: string;
	}>();

	const [roomState, setRoomState] = useState<RoomState | null>(null);
	const [status, setStatus] = useState<ConnectionStatus>("connecting");
	const [message, setMessage] = useState("Conectando con el servidor...");
	const [joined, setJoined] = useState<{
		room: string;
		name: string;
	} | null>(null); //puede ser tambien null y lo inicializamos asi

	const receivePieces = useGameStore((state) => state.receivePieces);
	const startGame = useGameStore((state) => state.startGame);
	const gameStatus = useGameStore((state) => state.status);

	useEffect(() =>
	{
		if (room === undefined || playerName === undefined)
		{
			setStatus("error");
			setMessage("The room or the player's name is not defined.");
			return;
		}

		let active = true;

		const handleConnect = () =>
		{
			socket.emit("join", {
				room,
				name: playerName,
			});
		};

		const handleJoined = (data: { room: string; name: string }) =>
		{
			if (!active)
				return;

			setJoined(data);
			setStatus("joined");
			setMessage("Te has unido correctamente a la sala.");
		};

		const handleJoinError = (error: JoinError) =>
		{
			if (!active)
				return;

			setJoined(null);
			setStatus("error");
			setMessage(getJoinErrorMessage(error));
		};

		const handleConnectError = () =>
		{
			if (!active)
				return;

			setStatus("error");
			setMessage("No se ha podido conectar con el servidor.");
		};

		const handleState = (state: RoomState) =>
		{
			if (!active)
				return;

			setRoomState(state);
		};

		const handlePieces = (pieces: PieceType[]) =>
		{
			if (!active)
				return;

			if (gameStatus === "waiting") // Inicializamos el tablero al recibir las primeras piezas
				startGame();

			
			receivePieces(pieces); // Guardamos en Zustand las piezas recibidas del servidor
		};

		const handleDisconnect = () =>
		{
			if (!active)
				return;

			setJoined(null);
			setStatus("connecting");
			setMessage("Conexión perdida. Esperando al servidor...");
		};

		//registramos los listeners(asociación entre el evento ("connect") y la función (handleConnect)) pero no se ejecutan solo se registran
		socket.on("connect", handleConnect);
		socket.on("joined", handleJoined);
		socket.on("joinError", handleJoinError);
		socket.on("connect_error", handleConnectError);
		socket.on("state", handleState);
		socket.on("pieces", handlePieces);
		socket.on("disconnect", handleDisconnect);

		if (socket.connected) //si ya existe la conexion con el socket ejecutamos directamente handleConnect
			handleConnect();
		else //si no  existe la conexion llamamos a socket.connect(). Cuando se establece la conexión, Socket.IO genera el evento "connect" y ejecuta handleConnect automáticamente.
			socket.connect();

		return () =>
		{
			active = false;

			//eliminamos los listeners que habíamos registrado
			socket.off("connect", handleConnect);
			socket.off("joined", handleJoined);
			socket.off("joinError", handleJoinError);
			socket.off("connect_error", handleConnectError);
			socket.off("state", handleState);
			socket.off("pieces", handlePieces);
			socket.off("disconnect", handleDisconnect);

			socket.disconnect(); //cierra la conexión cuando abandonamos la ruta
		};
	}, [room, playerName]);

	return (
		<main>
			<h1>Red Tetris</h1>

			<p>Sala solicitada: {room}</p>
			<p>Jugador solicitado: {playerName}</p>

			{/*role sirve para indicar a las tecnologías de asistencia qué tipo de información representa un elemento HTML*/}
			<p role="status">{message}</p>

			{status === "joined" && joined !== null && (
				<section>
					<h2>¡Bienvenido a la partida!</h2>
					<p>Sala confirmada: {joined.room}</p>
					<p>Nombre confirmado: {joined.name}</p>
				</section>
			)}

			{roomState !== null && (
				<section>
					<h2>Sala: {roomState.room}</h2>

					<p>Estado de la partida: {roomState.status}</p>

					<h3>Jugadores</h3>

					<ul>
						{roomState.players.map((player) => (
						<li key={player.name}>
							{player.name}
							{player.isAdmin && " (Anfitrión)"}
							{!player.isAlive && " (Eliminado)"}
						</li>
						))}
					</ul>
				</section>
			)}

			{roomState !== null && roomState.status === "waiting" && roomState.players.some((player) => player.name === joined?.name && player.isAdmin) && (
					<button onClick={() => socket.emit("start")}>
						Iniciar partida
					</button>
			)}

			{status === "error" && (
				<p role="alert">{message}</p>
			)}
		</main>
	);
}

function NotFoundPage()
{
	return <h1>Ruta no encontrada</h1>;
}

function App()
{
	return (
		<Routes>
			<Route
				path="/:room/:playerName" //es el patron que debe coincidir con la URL
				element={<RoomPage />}
			/>

			<Route
				path="*"
				element={<NotFoundPage />}
			/>
		</Routes>
	);
}

export default App;
