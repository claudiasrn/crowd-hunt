import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameBoard from "./GameBoard";

const IMAGE_ALT = "A large crowd of spectators at a race";

function getMenuButton() {
	return screen.queryByRole("button", { name: "yellow-cap" });
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("GameBoard", () => {
	it("shows no menu initially", () => {
		render(<GameBoard />);
		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("opens the menu when the image is clicked", async () => {
		const user = userEvent.setup();
		render(<GameBoard />);

		await user.click(screen.getByAltText(IMAGE_ALT));

		expect(screen.getByRole("button", { name: "yellow-cap" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "big-curls" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "orange-brim" })).toBeInTheDocument();
	});

	it("closes the menu when the image is clicked again", async () => {
		const user = userEvent.setup();
		render(<GameBoard />);
		const image = screen.getByAltText(IMAGE_ALT);

		await user.click(image);
		await user.click(image);

		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("closes the menu when Escape is pressed", async () => {
		const user = userEvent.setup();
		render(<GameBoard />);

		await user.click(screen.getByAltText(IMAGE_ALT));
		await user.keyboard("{Escape}");

		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("closes the menu when clicking outside the board", async () => {
		const user = userEvent.setup();
		render(
			<>
				<GameBoard />
				<button type="button">Outside</button>
			</>,
		);

		await user.click(screen.getByAltText(IMAGE_ALT));
		await user.click(screen.getByRole("button", { name: "Outside" }));

		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("logs the selection with coordinates and closes the menu", async () => {
		const user = userEvent.setup();
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		render(<GameBoard />);

		const image = screen.getByAltText(IMAGE_ALT);
		vi.spyOn(image, "getBoundingClientRect").mockReturnValue({
			left: 0,
			top: 0,
			width: 800,
			height: 600,
		});

		fireEvent.click(image, { clientX: 400, clientY: 300 });
		await user.click(screen.getByRole("button", { name: "yellow-cap" }));

		expect(logSpy).toHaveBeenCalledWith({ characterId: 1, x: 0.5, y: 0.5 });
		expect(getMenuButton()).not.toBeInTheDocument();
	});
});