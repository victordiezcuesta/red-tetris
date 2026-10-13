import { COLS, PENALTY_CELL, type Board } from "./board";

function isRowComplete(row: number[]): boolean
{
	for (let col = 0; col < row.length; col++)
	{
		if (row[col] === 0) //hay un hueco libre
			return false;
		if (row[col] === PENALTY_CELL)
			return false;
	}
	return true;
}

function createEmptyRow(): number[]
{
	const row: number[] = [];
	for (let col = 0; col < COLS; col++)
	{
		row.push(0);
	}
	return row;
}

export function clearLines(board: Board): { board: Board; rowsCleared: number }
{
	const keptRows: number[][] = [];
	let rowsCleared = 0;

	for (let row = 0; row < board.length; row++)
	{
		if (isRowComplete(board[row])) 
			rowsCleared++;
		else
			keptRows.push([...board[row]]); //nos quedamos con las filas no completas | con los ... hacemos que sea una copia con distinta ubicacion en la memoria
	}

	//creamos el tablero nuevo con el numero de filas vacias que hemos contado completas de piezas y con las nuevas que nos hemos quedado
	const newBoard: Board = [];
	for (let i = 0; i < rowsCleared; i++)
	{
		newBoard.push(createEmptyRow());
	}
	for (let i = 0; i < keptRows.length; i++)
	{
		newBoard.push(keptRows[i]);
	}

	return { board: newBoard, rowsCleared: rowsCleared };
}