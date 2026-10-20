import { useEffect, useState } from "react"; //son hooks que son funciones especiales que te permiten utilizar funcionalidades de React dentro de tus componentes
import { Route, Routes, useParams } from "react-router-dom";

import { socket } from "./socket/socket";
import type { JoinError, RoomState, StartError, PlayerState } from "./socket/events";

import "./App.css";

import { useGameStore } from "./store/gameStore";
import type { PieceType } from "./game/pieces";
import { GameBoard } from "./game/GameBoard";
import { getSpectrum, getOpponents, isAdminPlayer } from "./game/spectrum";
import { SpectrumView } from "./game/SpectrumView";
import { ScoreBoard } from "./game/ScoreBoard";

type ConnectionStatus = "connecting" | "joined" | "error";

const CONTROLS = [
	{ key: "←", text: "Mover a la izquierda" },
	{ key: "→", text: "Mover a la derecha" },
	{ key: "↑", text: "Rotar la pieza" },
	{ key: "↓", text: "Descenso rápido" },
	{ key: "ESP", text: "Caída instantánea" },
];

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

function getStartErrorMessage(error: StartError): string
{
	switch (error)
	{
		case "not_in_room":
			return "You are not in a room.";
		case "game_not_found":
			return "The room does not exist.";
		case "cannot_start":
			return "Only the host can start the game, and not while it is running.";
	}
}

function getRoomStatusLabel(status: string): string
{
	switch (status)
	{
		case "playing":
			return "EN JUEGO";
		case "finished":
			return "FINALIZADA";
		default:
			return "EN ESPERA";
	}
}

function getLinkLabel(status: ConnectionStatus): string
{
	switch (status)
	{
		case "connecting":
			return "CONECTANDO";
		case "joined":
			return "ENLACE ACTIVO";
		case "error":
			return "SIN ENLACE";
	}
}

function RoomPage()
{
	const { room, playerName } = useParams<{
		room: string;
		playerName: string;
	}>();

	const [startErrorMessage, setStartErrorMessage] = useState<string | null>(null);
	const [roomState, setRoomState] = useState<RoomState | null>(null);
	const [status, setStatus] = useState<ConnectionStatus>("connecting");
	const [message, setMessage] = useState("Conectando con el servidor...");
	const [joined, setJoined] = useState<{
		room: string;
		name: string;
	} | null>(null); //puede ser tambien null y lo inicializamos asi
	const [gameResult, setGameResult] = useState<{ 
		winner: string | null
	} | null>(null);

	//variables del tipo GameState
	const board = useGameStore((state) => state.board);
	const currentPiece = useGameStore((state) => state.currentPiece);
	const pieceQueueLength = useGameStore((state) => state.pieceQueue.length);
	const gameStatus = useGameStore((state) => state.status);

	//funciones del tipo GameActions
	const receivePieces = useGameStore((state) => state.receivePieces);
	const receivePenalty = useGameStore((state) => state.receivePenalty);
	const startGame = useGameStore((state) => state.startGame);
	const moveLeft = useGameStore((state) => state.moveLeft);
	const moveRight = useGameStore((state) => state.moveRight);
	const rotate = useGameStore((state) => state.rotate);
	const softDrop = useGameStore((state) => state.softDrop);
	const hardDrop = useGameStore((state) => state.hardDrop);
	const tick = useGameStore((state) => state.tick);
	const endGame = useGameStore((state) => state.endGame);

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

		if (pieceQueueLength < 3)
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

		const handleStartError = (error: StartError) =>
		{
			if (!active)
				return;

			setStartErrorMessage(getStartErrorMessage(error));
		};

		const handlePieces = (pieces: PieceType[]) =>
		{
			if (!active)
				return;

			const currentStatus = useGameStore.getState().status;
			if (currentStatus !== "playing") // primeras piezas de una partida nueva
			{
				setGameResult(null);
				setStartErrorMessage(null);
				startGame();
			}

			receivePieces(pieces);
		};
		const handlePenalty = (count: number) => {
			if (!active)
				return;

			receivePenalty(count);
		};

		const handleGameOver = (result: { winner: string | null }) =>
		{
			if (!active)
				return;

			setGameResult(result);
			endGame(); //dejamos de jugar si seguíamos vivos
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
		socket.on("gameOver", handleGameOver);
		socket.on("startError", handleStartError);

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
			socket.off("gameOver", handleGameOver);
			socket.off("startError", handleStartError);

			socket.disconnect(); //cierra la conexión cuando abandonamos la ruta
		};
	}, [room, playerName]);

	let opponents: PlayerState[] = [];
	if (roomState !== null && playerName !== undefined)
		opponents = getOpponents(roomState.players, playerName);

	const isAdmin = roomState !== null && joined !== null
		&& isAdminPlayer(roomState.players, joined.name);

	return (
		<div className="app">
			<header className="topbar">
				<div className="topbar-group">
					<span className="brand">RED-TETRIS</span>
					<span className="topbar-divider" />
					<span className="topbar-label">SALA</span>
					<span className="topbar-value">{room}</span>
				</div>

				<div className="topbar-group">
					<span className={`link link-${status}`}>
						<span className="link-dot" />
						{getLinkLabel(status)}
					</span>
					<span className="topbar-label">JUGADOR</span>
					<span className="topbar-value">{playerName}</span>
					{isAdmin && <span className="badge badge-admin">ANFITRIÓN</span>}
				</div>
			</header>

			<main className="mission">
				{/* ---------- Columna 1: jugadores + controles ---------- */}
				<section className="column column-side">
					<section className="column">
						<h2 className="section-title">01 · JUGADORES</h2>

						<ul className="player-list">
							{roomState !== null && roomState.players.map((player, index) => (
								<li
									key={player.name}
									className={`player-row${player.name === playerName ? " player-me" : ""}${player.isAlive ? "" : " player-out"}`}
								>
									<span className="player-index">{String(index + 1).padStart(2, "0")}</span>
									<span className="player-name">{player.name}</span>
									{player.isAdmin && <span className="badge">HOST</span>}
									{!player.isAlive && <span className="badge badge-out">OUT</span>}
								</li>
							))}
						</ul>

						<h2 className="section-title section-spaced">02 · CONTROLES</h2>

						<div className="controls">
							{CONTROLS.map((control) => (
								<div key={control.key} className="control-row">
									<kbd>{control.key}</kbd>
									<span>{control.text}</span>
								</div>
							))}
						</div>
					</section>
				</section>
				{/* ---------- Columna 2: tablero ---------- */}
				<section className="column">
					<div className="board-header">
						<h2 className="section-title">TABLERO 10×20</h2>
						<span className={`room-status room-${roomState?.status ?? "waiting"}`}>
							{getRoomStatusLabel(roomState?.status ?? "waiting")}
						</span>
					</div>

					<GameBoard board={board} currentPiece={currentPiece} />

					{gameStatus === "lost" && (
						<p className="notice notice-lost" role="alert">Has perdido la partida.</p>
					)}

					{gameResult !== null && (
						<p className="notice" role="status">
							{gameResult.winner !== null
								? `Fin de la partida. Ganador: ${gameResult.winner}`
								: "Fin de la partida."}
						</p>
					)}

					{isAdmin && roomState !== null && roomState.status !== "playing" && (
						<button
							className="start-button"
							onClick={() => {
								setStartErrorMessage(null);
								socket.emit("start");
							}}
						>
							{roomState.status === "finished" ? "NUEVA PARTIDA" : "INICIAR PARTIDA"}
						</button>
					)}

					{startErrorMessage !== null && (
						<p className="notice notice-lost" role="alert">{startErrorMessage}</p>
					)}
				</section>

				{/* ---------- Columna 3: espectro de rivales ---------- */}
				<section className="column column-side">
					<section className="column">
						<h2 className="section-title">03 · ESPECTRO DE RIVALES</h2>

						<div className="spectrum-list">
							{opponents.length === 0 && (
								<p className="empty-text">Sin rivales en la sala.</p>
							)}

							{opponents.map((opponent) => (
								<SpectrumView
									key={opponent.name}
									name={opponent.name}
									spectrum={opponent.spectrum}
									isAlive={opponent.isAlive}
								/>
							))}
						</div>
					</section>
				</section>

				{/* ---------- Columna 4: marcador ---------- */}
				<ScoreBoard />

			</main>

			<footer className="statusbar" role="status">{message}</footer>
		</div>
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
