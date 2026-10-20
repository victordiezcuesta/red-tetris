import type { Shape } from "./pieces";

// Recorta las filas y columnas vacias de la forma (la I pasa de 4x4 a 1x4)
export function trimShape(shape: Shape): Shape
{
	let minRow = shape.length;
	let maxRow = -1;
	let minCol = shape[0].length;
	let maxCol = -1;

	for (let y = 0; y < shape.length; y++)
	{
		for (let x = 0; x < shape[y].length; x++)
		{
			if (shape[y][x] === 0)
				continue;

			if (y < minRow)
				minRow = y;
			if (y > maxRow)
				maxRow = y;
			if (x < minCol)
				minCol = x;
			if (x > maxCol)
				maxCol = x;
		}
	}

	if (maxRow === -1) //forma vacia
		return [];

	const trimmed: Shape = [];
	for (let y = minRow; y <= maxRow; y++)
	{
		const row: number[] = [];
		for (let x = minCol; x <= maxCol; x++)
		{
			row.push(shape[y][x]);
		}
		trimmed.push(row);
	}

	return trimmed;
}