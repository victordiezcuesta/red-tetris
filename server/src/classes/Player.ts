const COLS = 10;

export class Player
{
	name: string;
	socketId: string;
	isAlive: boolean;
	spectrum: number[];
	nextPieceIndex: number;

	constructor(name: string, socketId: string)
	{
		this.name = name;
		this.socketId = socketId;
		this.isAlive = true;
		this.spectrum = Array<number>(COLS).fill(0);
		this.nextPieceIndex = 0;
	}

	reset(): void
	{
		this.isAlive = true;
		this.spectrum = Array<number>(COLS).fill(0);
		this.nextPieceIndex = 0;
	}
}