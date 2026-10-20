import { create } from "zustand";

import type { RoomState } from "../socket/events";

export type ConnectionStatus = "connecting" | "joined" | "error";

export type JoinedPlayer = {
	room: string;
	name: string;
};

export type GameResult = {
	winner: string | null;
};

export type RoomStore = {
	roomState: RoomState | null; // jugadores y estado de la sala que manda el servidor
	status: ConnectionStatus; // estado de la conexión
	message: string; // texto de la barra inferior
	joined: JoinedPlayer | null; // datos con los que nos hemos unido
	gameResult: GameResult | null; // resultado al terminar la partida
	startErrorMessage: string | null; // error al intentar iniciar
};

export const useRoomStore = create<RoomStore>()(() => ({ //creamos el store que no hay acciones: solo datos, por eso la función no recibe nada
	roomState: null,
	status: "connecting",
	message: "Conectando con el servidor...",
	joined: null,
	gameResult: null,
	startErrorMessage: null,
}));