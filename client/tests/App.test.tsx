import { describe, expect, it, vi } from "vitest"; //vi es un objeto que lo proporciona vitest que nos sirve para para crear funciones simuladas que se llaman mocks a ese tipo de funciones simuladas
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom"; //e el componente que permite a react router gestionar las rutas utilizando la URL que tenemos almacenada en la memoria para los tests
import App from "../src/App";

//socket de mentira: tiene los mismos métodos, pero no hacen nada
vi.mock("../src/socket/socket", () => ({
	socket: {
		connected: false,
		on: vi.fn(), //fn se refiere a la simulacion de una funcion, fn = function
		off: vi.fn(),
		emit: vi.fn(),
		connect: vi.fn(),
		disconnect: vi.fn(),
	},
}));

describe("App", () => {
	it("muestra 'Ruta no encontrada' si la URL no es /sala/jugador", () => {
		render(
			<MemoryRouter initialEntries={["/"]}>
				<App />
			</MemoryRouter>,
		);

		expect(screen.getByText("Ruta no encontrada")).toBeInTheDocument();
	});

	it("pinta la página de la sala con el nombre de la sala y del jugador", () => {
		render(
			<MemoryRouter initialEntries={["/sala1/victor"]}>
				<App />
			</MemoryRouter>,
		);

		expect(screen.getByText("RED-TETRIS")).toBeInTheDocument();
		expect(screen.getByText("sala1")).toBeInTheDocument();
		expect(screen.getByText("victor")).toBeInTheDocument();
		expect(screen.getByText("CONECTANDO")).toBeInTheDocument();
		expect(screen.getByText("Sin rivales en la sala.")).toBeInTheDocument();
	});
});