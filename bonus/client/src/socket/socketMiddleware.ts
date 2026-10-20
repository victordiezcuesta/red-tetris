import { socket } from "./socket";
import type { ChatMessage, JoinError, RoomState, StartError, TopScore } from "./events";
import type { PieceType } from "../game/pieces";
import { useGameStore } from "../store/gameStore";
import { useRoomStore, type GameResult, type JoinedPlayer } from "../store/roomStore";
import { getSpectrum } from "../game/spectrum";

const MAX_SHOWN = 30; // solo guardamos los 30 últimos mensajes

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

// APP --> SERVIDOR
export function sendStart(): void
{
	useRoomStore.setState({ startErrorMessage: null });
	socket.emit("start");
}

export function sendChat(text: string): void
{
	socket.emit("chat", text);
}

// SERVIDOR --> APP
export function connectToRoom(room: string, name: string): () => void // Registra todos los listeners y devuelve una función que los quita
{
	// Dejamos el store de la sala limpio (antes cada useState nacía vacío al montar)
	useRoomStore.setState({
		roomState: null,
		status: "connecting",
		message: "Conectando con el servidor...",
		joined: null,
		gameResult: null,
		startErrorMessage: null,
		messages: [],
	});

	const handleConnect = () =>
	{
		socket.emit("join", { room: room, name: name });
	};

	const handleJoined = (data: JoinedPlayer) =>
	{
		useRoomStore.setState({
			joined: data,
			status: "joined",
			message: "Te has unido correctamente a la sala.",
		});
	};

	const handleJoinError = (error: JoinError) =>
	{
		useRoomStore.setState({
			joined: null,
			status: "error",
			message: getJoinErrorMessage(error),
		});
	};

	const handleConnectError = () =>
	{
		useRoomStore.setState({
			status: "error",
			message: "No se ha podido conectar con el servidor.",
		});
	};

	const handleDisconnect = () =>
	{
		useRoomStore.setState({
			joined: null,
			status: "connecting",
			message: "Conexión perdida. Esperando al servidor...",
		});
	};

	const handleState = (state: RoomState) =>
	{
		useRoomStore.setState({ roomState: state });
	};

	const handleStartError = (error: StartError) =>
	{
		useRoomStore.setState({ startErrorMessage: getStartErrorMessage(error) });
	};

	const handlePieces = (pieces: PieceType[]) =>
	{
		const gameStore = useGameStore.getState();
		if (gameStore.status !== "playing") // primeras piezas de una partida nueva
		{
			useRoomStore.setState({ gameResult: null, startErrorMessage: null });
			gameStore.startGame();
		}

		gameStore.receivePieces(pieces);
	};

	const handlePenalty = (count: number) =>
	{
		useGameStore.getState().receivePenalty(count);
	};

	const handleChat = (message: ChatMessage) =>
	{
		useRoomStore.setState((state) => ({
			messages: [...state.messages, message].slice(-MAX_SHOWN),
		}));
	};

	const handleTopScores = (top: TopScore[]) =>
	{
		useRoomStore.setState({ topScores: top });
	};

	const handleGameOver = (result: GameResult) =>
	{
		useRoomStore.setState({ gameResult: result });
		useGameStore.getState().endGame(); // dejamos de jugar si seguíamos vivos
	};

	//registramos los listeners(asociación entre el evento ("connect") y la función (handleConnect)) pero no se ejecutan solo se registran
	socket.on("connect", handleConnect);
	socket.on("joined", handleJoined);
	socket.on("joinError", handleJoinError);
	socket.on("connect_error", handleConnectError);
	socket.on("disconnect", handleDisconnect);
	socket.on("state", handleState);
	socket.on("startError", handleStartError);
	socket.on("pieces", handlePieces);
	socket.on("penalty", handlePenalty);
	socket.on("chat", handleChat);
	socket.on("topScores", handleTopScores);
	socket.on("gameOver", handleGameOver);

	// App -> servidor: reaccionamos a los cambios del store de juego
	const unsubscribe = useGameStore.subscribe((state, previous) =>
	{
		const justStarted = state.status === "playing" && previous.status !== "playing";

		if (state.status === "playing" && (justStarted || state.board !== previous.board))
			socket.emit("spectrum", getSpectrum(state.board));  //enviamos las alturas de cada columna al servidor

		if (state.status === "playing" && previous.status === "playing" && state.pieceQueue.length < 3 && state.pieceQueue.length < previous.pieceQueue.length)
			socket.emit("needPieces", 5); //pedimos mas piezas si en la cola nos quedan menos de 3

		if (state.status === "lost" && previous.status !== "lost")
			socket.emit("lost"); ////avisamos al servidor de que hemos perdido

		if (state.lastCleared !== null && state.lastCleared !== previous.lastCleared)
			socket.emit("linesCleared", state.lastCleared.count); //avisamos que limpiamos lineas lastCleared es un objeto nuevo cada vez
	});

	if (socket.connected) //si ya existe la conexion con el socket ejecutamos directamente handleConnect
		handleConnect();
	else //si no  existe la conexion llamamos a socket.connect(). Cuando se establece la conexión, Socket.IO genera el evento "connect" y ejecuta handleConnect automáticamente
		socket.connect();

	return () =>
	{
		unsubscribe();

		socket.off("connect", handleConnect);
		socket.off("joined", handleJoined);
		socket.off("joinError", handleJoinError);
		socket.off("connect_error", handleConnectError);
		socket.off("disconnect", handleDisconnect);
		socket.off("state", handleState);
		socket.off("startError", handleStartError);
		socket.off("pieces", handlePieces);
		socket.off("penalty", handlePenalty);
		socket.off("chat", handleChat);
		socket.off("topScores", handleTopScores);
		socket.off("gameOver", handleGameOver);

		socket.disconnect(); // cierra la conexión cuando abandonamos la ruta
	};
}