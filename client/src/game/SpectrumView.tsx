import { getBarHeightPercent } from "./spectrum";

type SpectrumViewProps = {
	name: string;
	spectrum: number[];
	isAlive: boolean;
};

export function SpectrumView({ name, spectrum, isAlive }: SpectrumViewProps)
{
	return (
		<div className={`spectrum${isAlive ? "" : " spectrum-dead"}`}>
			<h3>
				{name}
				{!isAlive && " (Eliminado)"}
			</h3>

			<div
				className="spectrum-grid"
				role="img"
				aria-label={`Spectrum de ${name}: ${spectrum.join(", ")}`}
			>
				{spectrum.map((height, col) => (
					<div key={col} className="spectrum-column">
						<div
							className="spectrum-bar"
							style={{ height: `${getBarHeightPercent(height)}%` }}
						/>
					</div>
				))}
			</div>
		</div>
	);
}