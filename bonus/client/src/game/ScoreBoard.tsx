import { useEffect, useState } from "react";

import { socket } from "../socket/socket";
import { useGameStore } from "../store/gameStore";
import "./bonus.css";

function getLinePoints(cleared: number): number
{
	switch (cleared)
	{
		case 1:
			return 100;
		case 2:
			return 300;
		case 3:
			return 500;
		case 4:
			return 800;
		default:
			return 0; //no se puede conseguir limpiar mas lineas en un solo movimiento porque la pieza mas grande verticalmente es la I
	}
}

export function ScoreBoard()
{
	const [score, setScore] = useState(0); //no utilizamos una variable local porque se volvería a inicializar cada vez que React ejecutara el componente
	const [lines, setLines] = useState(0);

	useEffect(() => {
		const handleOutgoing = (event: string, cleared: unknown) => {
			if (event !== "linesCleared" || typeof cleared !== "number") // El store emite "linesCleared" cada vez que se completan lineas: aprovechamos ese evento
				return;

			setScore((previous) => previous + getLinePoints(cleared)); //es una variable que estamos declarando en ese momento y solo sirve para cada set por separado
			setLines((previous) => previous + cleared);
		};

		socket.onAnyOutgoing(handleOutgoing); //registra handleOutgoing para que Socket.IO lo ejecute cuando se emitan eventos salientes

		// cada veez que cambie el estado de useGameStore ejecutamos esta funcion que lo que provoca es el reinicio de la lineas y de la puntuacion
		const unsubscribe = useGameStore.subscribe((state, previousState) => { //state y previousState lo proporciona Zustand
			if (state.status === "playing" && previousState.status !== "playing")
			{
				setScore(0);
				setLines(0);
			}
		});

		return () => {
			socket.offAnyOutgoing(handleOutgoing);
			unsubscribe();
		};
	}, []);

	return (
		<section className="column column-side">
			<section className="column">
				<h2 className="section-title">04 · MARCADOR</h2>

				<div className="score-panel">
					<span className="score-label">PUNTOS</span>
					<span className="score-value">{score}</span>
				</div>

				<div className="score-panel score-panel-small">
					<span className="score-label">LÍNEAS</span>
					<span className="score-value">{lines}</span>
				</div>
			</section>
		</section>
	);
}