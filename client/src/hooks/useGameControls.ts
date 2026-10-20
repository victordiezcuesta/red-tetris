
import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export function useGameControls()
{
	const gameStatus = useGameStore((state) => state.status);

	const moveLeft = useGameStore((state) => state.moveLeft);
	const moveRight = useGameStore((state) => state.moveRight);
	const rotate = useGameStore((state) => state.rotate);
	const softDrop = useGameStore((state) => state.softDrop);
	const hardDrop = useGameStore((state) => state.hardDrop);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (gameStatus !== "playing")
			return;

			switch (event.key)
			{
			case "ArrowLeft":
				event.preventDefault();  //evitamos que el navegador mueva a la derecha la pantalla
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

		window.addEventListener("keydown", handleKeyDown); //detectar cuándo el usuario pulsa una tecla del teclado y ejecutar la función

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [gameStatus, moveLeft, moveRight, rotate, softDrop, hardDrop]);  //ejecuta el useeffect cuando cambie algo de esto
}
