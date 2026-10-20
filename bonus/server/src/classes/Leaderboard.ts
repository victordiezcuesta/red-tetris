export type TopScore = {
	name: string;
	room: string;
	score: number;
};

const MAX_ENTRIES = 3;

export class Leaderboard
{
	entries: TopScore[];

	constructor()
	{
		this.entries = [];
	}

	add(entry: TopScore): boolean //devuelve true si el score del usuario de la sala ha entrado en el top
	{
		this.entries.push(entry);
		this.entries.sort((a, b) => b.score - a.score);

		if (this.entries.length > MAX_ENTRIES)
		{
			const removed = this.entries.pop();
			return removed !== entry; //si el que sale es el nuevo, no ha entrado
		}
		return true;
	}

	getTop(): TopScore[]
	{
		return [...this.entries]; //copia para que nadie modifique la lista original
	}
}