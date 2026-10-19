import { useEffect, useState } from "react"; //son hooks que son funciones especiales que te permiten utilizar funcionalidades de React dentro de tus componentes
import { Route, Routes, useParams } from "react-router-dom";

import { socket } from "./socket/socket";
import type { JoinError, RoomState } from "./socket/events";

import "./App.css";

import { useGameStore } from "./store/gameStore";
import type { PieceType } from "./game/pieces";
import { GameBoard } from "./game/GameBoard";
import { getSpectrum } from "./game/spectrum";

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

	const board = useGameStore((state) => state.board);
	const currentPiece = useGameStore((state) => state.currentPiece);
	const pieceQueueLength = useGameStore((state) => state.pieceQueue.length);
	const gameStatus = useGameStore((state) => state.status);
	const receivePieces = useGameStore((state) => state.receivePieces);
	const receivePenalty = useGameStore((state) => state.receivePenalty);
	const startGame = useGameStore((state) => state.startGame);
	const moveLeft = useGameStore((state) => state.moveLeft);
	const moveRight = useGameStore((state) => state.moveRight);
	const rotate = useGameStore((state) => state.rotate);
	const softDrop = useGameStore((state) => state.softDrop);
	const hardDrop = useGameStore((state) => state.hardDrop);
	const tick = useGameStore((state) => state.tick);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (gameStatus !== "playing")
				return;

			switch (event.key)
			{
				case "ArrowLeft":
					event.preventDefault(); //evitamos que el navegador mueva a la derecha la pantalla
					moveLeft();
					break;

				case "ArrowRight":
					event.preventDefault();
					moveRight();
					break;

				case "ArrowUp":
					event.preventDefault();
					rotate();
					break;

				case "ArrowDown":
					event.preventDefault();
					softDrop();
					break;

				case " ":
					event.preventDefault();
					hardDrop();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);//detectar cuándo el usuario pulsa una tecla del teclado y ejecutar la función

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [gameStatus, moveLeft, moveRight, rotate, softDrop, hardDrop]); //ejecuta el useeffect cuando cambie algo de esto

	useEffect(() => {
		if (gameStatus !== "playing")
			return;

		socket.emit("spectrum", getSpectrum(board)); //enviamos las alturas de cada columna al servidor
	}, [gameStatus, board]);

	useEffect(() => {
		if (gameStatus !== "playing")
			return;

		const intervalId = window.setInterval(() => {
			tick();
		}, 800); //vamos bajando la pieza cada 800 ms

		return () => {
			window.clearInterval(intervalId);
		};
	}, [gameStatus, tick]);

	useEffect(() => {
		if (gameStatus !== "playing")
			return;

		if (pieceQueueLength === 0 && currentPiece === null)
			socket.emit("needPieces", 5);
	}, [gameStatus, pieceQueueLength, currentPiece]);

	useEffect(() => {
		if (gameStatus !== "lost")
			return;

		socket.emit("lost"); //avisamos al servidor de que hemos perdido
	}, [gameStatus]);

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

			const currentStatus = useGameStore.getState().status;
			if (currentStatus === "waiting" || currentStatus === "lost") // Inicializamos el tablero al recibir las primeras piezas
				startGame();

			
			receivePieces(pieces); // Guardamos en Zustand las piezas recibidas del servidor
		};

		const handlePenalty = (count: number) => {
			if (!active)
				return;

			receivePenalty(count);
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
		socket.on("penalty", handlePenalty);
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
			socket.off("penalty", handlePenalty);
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

			{roomState !== null && roomState.status === "playing" && (
				<section className="game-layout">
					<div>
						<h2>Tu tablero</h2>

						<GameBoard
							board={board}
							currentPiece={currentPiece}
						/>

						{gameStatus === "lost" && (
							<p role="alert">Has perdido la partida.</p>
						)}
					</div>

					<div className="game-info">
						<h2>Controles</h2>

						<ul className="game-controls">
							<li>← Mover a la izquierda</li>
							<li>→ Mover a la derecha</li>
							<li>↑ Rotar la pieza</li>
							<li>↓ Descenso rápido</li>
							<li>Espacio: caída instantánea</li>
						</ul>
					</div>
				</section>
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
