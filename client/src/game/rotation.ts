import type { Piece, Shape } from "./pieces";

export const rotateShape = (shape: Shape): Shape => {
  const size = shape.length;
  const rotated: Shape = []; //declaramos rotated cuyo tipo es shape y iniciamos la variable con un array vacio

  for (let row = 0; row < size; row++) {
    const newRow: number[] = [];
    for (let col = 0; col < size; col++) {
      newRow.push(shape[size - 1 - col][row]);
    }
    rotated.push(newRow);
  }

  return rotated;
};

export const rotatePiece = (piece: Piece): Piece => {
  const newShape = rotateShape(piece.shape);

  return {
    type: piece.type,
    shape: newShape,
    x: piece.x,
    y: piece.y,
  };
};
