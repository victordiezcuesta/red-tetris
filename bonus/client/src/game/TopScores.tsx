import { useEffect, useState } from "react";

import { socket } from "../socket/socket";
import type { TopScore } from "../socket/events";
import "./bonus.css";

export function TopScores()
{
	const [scores, setScores] = useState<TopScore[]>([]);

	useEffect(() => {
		const handleTopScores = (top: TopScore[]) => {
			setScores(top);
		};

		socket.on("topScores", handleTopScores);

		return () => {
			socket.off("topScores", handleTopScores);
		};
	}, []);

	return (
		<section className="column">
			<h2 className="section-title">05 · TOP 3 GLOBAL</h2>

			{scores.length === 0 && (
				<p className="empty-text">Aún no hay puntuaciones.</p>
			)}

			{scores.map((entry, index) => (
				<div key={index} className="top-row">
					<span className="top-position">{index + 1}</span>
					<span className="top-name">{entry.name} <span className="top-room">({entry.room})</span></span>
					<span className="top-score">{entry.score}</span>
				</div>
			))}
		</section>
	);
}