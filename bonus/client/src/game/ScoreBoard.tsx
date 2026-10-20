import { useEffect, useState } from "react";

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
		const unsubscribe = useGameStore.subscribe((state, previousState) => { //state y previousState lo proporciona Zustand
			// partida nueva: reiniciamos marcador
			if (state.status === "playing" && previousState.status !== "playing")
			{
				setScore(0);
				setLines(0);
			}

			// se han limpiado líneas
			if (state.lastCleared !== null && state.lastCleared !== previousState.lastCleared)
			{
				const cleared = state.lastCleared.count; // lo guardamos aquí porque dentro de setScore TypeScript ya no sabe que no es null
				setScore((previous) => previous + getLinePoints(cleared));
				setLines((previous) => previous + cleared);
			}
		});

		return unsubscribe;
	}, []);

	return (
		<section className="column">
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