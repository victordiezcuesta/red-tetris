import { useEffect } from "react";

import { connectToRoom, sendStart } from "../socket/socketMiddleware";
import { useRoomStore } from "../store/roomStore";

export function useRoom(room: string | undefined, playerName: string | undefined)
{
	const roomState = useRoomStore((state) => state.roomState);
	const status = useRoomStore((state) => state.status);
	const message = useRoomStore((state) => state.message);
	const joined = useRoomStore((state) => state.joined);
	const gameResult = useRoomStore((state) => state.gameResult);
	const startErrorMessage = useRoomStore((state) => state.startErrorMessage);

	useEffect(() =>
	{
		if (room === undefined || playerName === undefined)
		{
			useRoomStore.setState({
				status: "error",
				message: "The room or the player's name is not defined.",
			});
			return;
		}

		return connectToRoom(room, playerName); // devuelve la función que limpia al salir
	}, [room, playerName]);

	return {
		roomState,
		status,
		message,
		joined,
		gameResult,
		startErrorMessage,
		requestStart: sendStart,
	};
}