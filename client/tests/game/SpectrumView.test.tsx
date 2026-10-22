import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpectrumView } from "../../src/game/SpectrumView";

const spectrum = [2, 1, 4, 2, 0, 3, 1, 0, 0, 0];

describe("SpectrumView", () => {
	it("muestra el nombre, que está vivo y la altura máxima", () => {
		render(<SpectrumView name="victor" spectrum={spectrum} isAlive={true} />);

		expect(screen.getByText("victor")).toBeInTheDocument(); //toBeInTheDocument es para comprobar que un elemento existe en el DOM(es la representación de una página HTML que el navegador crea en memoria para que JavaScript pueda consultar y modificar sus elementos)
		expect(screen.getByText("VIVO")).toBeInTheDocument();
		expect(screen.getByText("4 / 20")).toBeInTheDocument();
	});

	it("muestra ELIMINADO y la clase spectrum-dead si el jugador ha perdido", () => {
		const { container } = render(<SpectrumView name="victor" spectrum={spectrum} isAlive={false} />);

		expect(screen.getByText("ELIMINADO")).toBeInTheDocument();
		expect(container.firstChild).toHaveClass("spectrum-dead");
	});
});