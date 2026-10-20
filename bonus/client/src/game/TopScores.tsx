import { useRoomStore } from "../store/roomStore";

import "./bonus.css";

export function TopScores()
{
	const scores = useRoomStore((state) => state.topScores);

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