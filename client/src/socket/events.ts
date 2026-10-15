import type { PieceType } from "../game/pieces";

export type RoomStatus = "waiting" | "playing" | "finished";

export type PlayerState = {
	name: string;
	spectrum: number[];
	isAlive: boolean;
	isAdmin: boolean;
};

export type RoomState = {
	room: string;
	status: RoomStatus;
	players: PlayerState[];
};

export type JoinError = "invalid_name" | "already_started" | "name_taken";
export type StartError = "not_in_room" | "game_not_found" | "cannot_start";

export type ServerToClientEvents = {
	joined: (data: { room: string; name: string }) => void;
	joinError: (error: JoinError) => void;
	state: (state: RoomState) => void;
	pieces: (pieces: PieceType[]) => void;
	penalty: (count: number) => void;
	gameOver: (result: { winner: string | null }) => void;
	startError: (error: StartError) => void;
};

export type ClientToServerEvents = {
	join: (data: { room: string; name: string }) => void;
	start: () => void;
	needPieces: (count?: number) => void;
	spectrum: (spectrum: number[]) => void;
	linesCleared: (cleared: number) => void;
	lost: () => void;
};