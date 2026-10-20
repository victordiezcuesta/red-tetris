import { useEffect } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import { socket } from "./socket/socket";
import type { PlayerState } from "./socket/events";

import "./App.css";

import { useGameStore } from "./store/gameStore";
import { useGameControls } from "./hooks/useGameControls";
import { useGameLoop } from "./hooks/useGameLoop";
import { useRoom } from "./hooks/useRoom";

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

	const {
		roomState,
		status,
		message,
		joined,
		gameResult,
		startErrorMessage,
		requestStart,
	} = useRoom(room, playerName); //hook del control del estado de la sala

	//variables del tipo GameState
	const board = useGameStore((state) => state.board);
	const currentPiece = useGameStore((state) => state.currentPiece);
	const pieceQueueLength = useGameStore((state) => state.pieceQueue.length);
	const gameStatus = useGameStore((state) => state.status);

	useGameControls(); //hoook que controla el manejo del teclado y los movimientos
	useGameLoop(); //hook que controla la caída automática de las piezas

	useEffect(() => {
		if (gameStatus !== "playing")
			return;

		socket.emit("spectrum", getSpectrum(board)); //enviamos las alturas de cada columna al servidor
	}, [gameStatus, board]);

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
							onClick={requestStart}
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
