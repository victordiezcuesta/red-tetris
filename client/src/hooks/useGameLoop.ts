
import { useEffect } from "react";

import { useGameStore } from "../store/gameStore";

export function useGameLoop()
{
	const gameStatus = useGameStore((state) => state.status);
	const tick = useGameStore((state) => state.tick);

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
}
