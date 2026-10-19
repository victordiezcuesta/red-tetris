import { COLS, PENALTY_CELL, type Board } from "./board";

function createPenaltyRow(): number[]
{
	const row: number[] = [];

	for (let col = 0; col < COLS; col++)
	{
		row.push(PENALTY_CELL); //fila de 9
	}
	return row;
}

export function getPenaltyCount(cleared: number): number
{
	if (cleared <= 1) //si un jugador completa 1 el rival no recibe penalizacionn (receive n - 1 indestructible penalty lines)
		return 0;
	return cleared - 1;
}

export function hasRowOverflow(board: Board, count: number): boolean
{
	let safeCount = count;

	if (safeCount < 0)
		safeCount = 0;
	if (safeCount > board.length)
		safeCount = board.length;

	for (let row = 0; row < safeCount; row++)
	{
		if (board[row].some((cell) => cell !== 0)) //comprobamos si al menos una celda de esa fila contiene un valor distinto de 0
			return true;
	}

	return false;

}

export function addPenaltyLines(board: Board, count: number): Board
{
	let safeCount = count; //numero de filas que son penalizadas
	if (safeCount < 0)
		safeCount = 0;
	if (safeCount > board.length)
		safeCount = board.length;

	const newBoard: Board = [];
	for (let row = safeCount; row < board.length; row++)
	{
		newBoard.push([...board[row]]);
	}

	for (let i = 0; i < safeCount; i++)
	{
		newBoard.push(createPenaltyRow()); //añadimos las filas de penalizacion abajo
	}

	return newBoard;
}