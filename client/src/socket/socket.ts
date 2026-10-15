import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./events";

const SERVER_URL: string | undefined = import.meta.env.PROD // import.meta.env.PROD es una variable que Vite rellena sola: vale true cuando haces el build de producción y false mientras desarrollas
	? undefined // si import.meta.env.PROD vale true 
	: (import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000"); //si vale false

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
	autoConnect: false, //el socket lo dejamos apagado hasta que cada cliente se conecte a la sala
});