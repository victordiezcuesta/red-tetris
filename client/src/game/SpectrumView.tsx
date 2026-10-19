import { ROWS } from "./board";
import { getBarHeightPercent, getMaxHeight } from "./spectrum";

type SpectrumViewProps = {
	name: string;
	spectrum: number[];
	isAlive: boolean;
};

export function SpectrumView({ name, spectrum, isAlive }: SpectrumViewProps)
{
	return (
		<div className={`spectrum${isAlive ? "" : " spectrum-dead"}`}>
			<div className="spectrum-header">
				<h3>{name}</h3>
				<span className={isAlive ? "tag-alive" : "tag-dead"}>
					{isAlive ? "VIVO" : "ELIMINADO"}
				</span>
			</div>

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

			<div className="spectrum-footer">
				<span>Altura máx.</span>
				<span>{getMaxHeight(spectrum)} / {ROWS}</span>
			</div>
		</div>
	);
}