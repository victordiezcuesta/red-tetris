
import { useEffect, useState } from "react";

import { socket } from "../socket/socket";
import type { JoinError, RoomState, StartError } from "../socket/events";
import type { PieceType } from "../game/pieces";
import { useGameStore } from "../store/gameStore";

type ConnectionStatus = "connecting" | "joined" | "error";

type JoinedPlayer = {
	room: string;
	name: string;
};

type GameResult = {
	winner: string | null;
};

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

export function useRoom(room: string | undefined, playerName: string | undefined)
{
	const [startErrorMessage, setStartErrorMessage] = useState<string | null>(null);
	const [roomState, setRoomState] = useState<RoomState | null>(null);
	const [status, setStatus] = useState<ConnectionStatus>("connecting");
	const [message, setMessage] = useState("Conectando con el servidor...");
	const [joined, setJoined] = useState<JoinedPlayer | null>(null);
	const [gameResult, setGameResult] = useState<GameResult | null>(null);

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

		const handleJoined = (data: JoinedPlayer) =>
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

			const gameStore = useGameStore.getState();
			if (gameStore.status !== "playing") // primeras piezas de una partida nueva
			{
				setGameResult(null);
				setStartErrorMessage(null);
				gameStore.startGame();
			}

			gameStore.receivePieces(pieces);
		};

		const handlePenalty = (count: number) =>
		{
			if (!active)
				return;

			useGameStore.getState().receivePenalty(count);
		};

		const handleGameOver = (result: GameResult) =>
		{
			if (!active)
				return;

			setGameResult(result);
			useGameStore.getState().endGame(); //dejamos de jugar si seguíamos vivos
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

		if (socket.connected)  //si ya existe la conexion con el socket ejecutamos directamente handleConnect
			handleConnect();
		else //si no  existe la conexion llamamos a socket.connect(). Cuando se establece la conexión, Socket.IO genera el evento "connect" y ejecuta handleConnect automáticamente
			socket.connect();

		return () =>
		{
			active = false;

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

	const requestStart = () =>
	{
		setStartErrorMessage(null);
		socket.emit("start");
	};

	return {
		roomState,
		status,
		message,
		joined,
		gameResult,
		startErrorMessage,
		requestStart,
	};
}
