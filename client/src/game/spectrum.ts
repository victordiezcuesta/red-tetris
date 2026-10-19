import { COLS, ROWS, type Board } from "./board";
import type { PlayerState } from "../socket/events";

export const getSpectrum = (board: Board): number[] => {
	const spectrum: number[] = [];

	for (let col = 0; col < COLS; col++) // para cada columna (0 a 9)
	{
		let height = 0; // si no hay nada, altura 0

		for (let row = 0; row < board.length; row++)// de arriba a abajo
		{ 
			if (board[row][col] !== 0)// ¿hay un bloque aquí?
			{
				height = board.length - row; // altura = filas hasta el suelo
				break; // ya lo encontramos, paramos
			}
		}

		spectrum.push(height); // guardamos el resultado
	}

	return spectrum;
};

export const getBarHeightPercent = (height: number): number => {
	if (height <= 0)
		return 0;
	if (height >= ROWS)
		return 100;
	return (height / ROWS) * 100;
};

// Devuelve todos los jugadores menos nosotros
export const getOpponents = (players: PlayerState[], myName: string): PlayerState[] => {
	const opponents: PlayerState[] = [];

	for (let i = 0; i < players.length; i++)
	{
		if (players[i].name !== myName)
			opponents.push(players[i]);
	}

	return opponents;
};

// Altura de la columna más alta (para "Altura máx. 10 / 20")
export const getMaxHeight = (spectrum: number[]): number => {
	let max = 0;

	for (let i = 0; i < spectrum.length; i++)
	{
		if (spectrum[i] > max)
			max = spectrum[i];
	}

	return max;
};

// Devuelve true si el jugador con ese nombre es el anfitrión
export const isAdminPlayer = (players: PlayerState[], name: string): boolean => {
	for (let i = 0; i < players.length; i++)
	{
		if (players[i].name === name && players[i].isAdmin)
			return true;
	}

	return false;
};