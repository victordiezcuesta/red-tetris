import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { io as connect, type Socket } from "socket.io-client";

const sockets: Socket[] = [];

// Esperamos hasta que el servidor responda el evento que le pasamos y devolvemos lo que corresponde a ese evento, como la transmision de sockets va por red puede tardar un poco y por eso hacemos esto
const waitFor = (socket: Socket, event: string): Promise<any> =>
	new Promise((resolve) => socket.once(event, resolve)); //promise es objeto que representa un resultado que todavía no existe, pero que va a llegar en el futuro

// Crea un cliente ya conectado al servidor
const newClient = async (): Promise<Socket> => {
	const socket = connect(`http://localhost:4000`, { forceNew: true });
	sockets.push(socket);
	await waitFor(socket, "connect");
	return socket;
};

beforeAll(async () => {
	process.env.PORT = String(4000);
	await import("../src/index.js"); // arranca el servidor
	await new Promise((resolve) => setTimeout(resolve, 200)); 
});

afterAll(() => {
	for (let i = 0; i < sockets.length; i++)
	{
		sockets[i].disconnect();
	}
});

describe("servidor", () => {
	it("un jugador válido entra en la sala", async () => {
		const socket = await newClient(); //con el await esperamos el aviso
		socket.emit("join", { room: "sala1", name: "victor" });

		expect(await waitFor(socket, "joined")).toEqual({ room: "sala1", name: "victor" });
	});

	it("rechaza un nombre inválido por el espacio y el !", async () => {
		const socket = await newClient();
		socket.emit("join", { room: "sala2", name: "no valido!" });

		expect(await waitFor(socket, "joinError")).toBe("invalid_name");
	});

	it("start da error si no estás en una sala", async () => {
		const socket = await newClient();
		socket.emit("start");

		expect(await waitFor(socket, "startError")).toBe("not_in_room");
	});

	it("el admin inicia la partida y recibe 10 piezas, luego pide 5 más", async () => {
		const socket = await newClient();
		socket.emit("join", { room: "sala3", name: "victor" });
		await waitFor(socket, "joined");

		socket.emit("start");
		expect(await waitFor(socket, "pieces")).toHaveLength(10);

		socket.emit("needPieces", 5);
		expect(await waitFor(socket, "pieces")).toHaveLength(5);
	});

	it("si el único jugador pierde, la partida termina sin ganador", async () => {
		const socket = await newClient();
		socket.emit("join", { room: "sala4", name: "victor" });
		await waitFor(socket, "joined");
		socket.emit("start");
		await waitFor(socket, "pieces");

		socket.emit("lost");

		expect(await waitFor(socket, "gameOver")).toEqual({ winner: null });
	});
});