import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameBoard from "./GameBoard";
import { startGame, submitGuess } from "../api";

vi.mock("../api", () => ({
	startGame: vi.fn(),
	submitGuess: vi.fn(),
	submitName: vi.fn(),
	getScores: vi.fn(),
}));

const IMAGE_ALT = "A large crowd of spectators at a race";

const GAME = {
	gameId: "game-1",
	image: { url: "/images/test.jpg" },
	targets: [
		{ id: 1, name: "yellow-cap", thumbnail: "/images/targets/yellow-cap.jpg" },
		{ id: 2, name: "big-curls", thumbnail: "/images/targets/big-curls.jpg" },
		{
			id: 3,
			name: "orange-brim",
			thumbnail: "/images/targets/orange-brim.jpg",
		},
	],
};

function getMenuButton(name = "yellow-cap") {
	return screen.queryByRole("button", { name });
}

async function renderBoard() {
	render(<GameBoard onPlayAgain={() => {}} />);
	return screen.findByAltText(IMAGE_ALT);
}

// Clicks the image at its center with a fake 800x600 rect, so coords are 0.5, 0.5
function clickImageCenter(image) {
	vi.spyOn(image, "getBoundingClientRect").mockReturnValue({
		left: 0,
		top: 0,
		width: 800,
		height: 600,
	});
	fireEvent.click(image, { clientX: 400, clientY: 300 });
}

beforeEach(() => {
	vi.clearAllMocks();
	startGame.mockResolvedValue(GAME);
});

describe("GameBoard: loading", () => {
	it("starts a game on mount and shows the image", async () => {
		await renderBoard();
		expect(startGame).toHaveBeenCalledTimes(1);
	});

	it("shows an error if the game can't start", async () => {
		startGame.mockRejectedValue(new Error("Server down"));
		render(<GameBoard onPlayAgain={() => {}} />);

		expect(
			await screen.findByText("Couldn't start the game: Server down"),
		).toBeInTheDocument();
	});
});

describe("GameBoard: target box", () => {
	it("shows no menu initially", async () => {
		await renderBoard();
		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("opens the menu with the game's targets on click", async () => {
		const user = userEvent.setup();
		const image = await renderBoard();

		await user.click(image);

		GAME.targets.forEach((t) => {
			expect(screen.getByRole("button", { name: t.name })).toBeInTheDocument();
		});
	});

	it("closes the menu when the image is clicked again", async () => {
		const user = userEvent.setup();
		const image = await renderBoard();

		await user.click(image);
		await user.click(image);

		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("closes the menu when Escape is pressed", async () => {
		const user = userEvent.setup();
		const image = await renderBoard();

		await user.click(image);
		await user.keyboard("{Escape}");

		expect(getMenuButton()).not.toBeInTheDocument();
	});

	it("closes the menu when clicking outside the board", async () => {
		const user = userEvent.setup();
		render(
			<>
				<GameBoard onPlayAgain={() => {}} />
				<button type="button">Outside</button>
			</>,
		);
		const image = await screen.findByAltText(IMAGE_ALT);

		await user.click(image);
		await user.click(screen.getByRole("button", { name: "Outside" }));

		expect(getMenuButton()).not.toBeInTheDocument();
	});
});

describe("GameBoard: guessing", () => {
	it("sends the guess with the game id and click coordinates", async () => {
		const user = userEvent.setup();
		submitGuess.mockResolvedValue({ correct: false });
		const image = await renderBoard();

		clickImageCenter(image);
		await user.click(screen.getByRole("button", { name: "yellow-cap" }));

		expect(submitGuess).toHaveBeenCalledWith("game-1", 1, 0.5, 0.5);
	});

	it("shows feedback on a miss", async () => {
		const user = userEvent.setup();
		submitGuess.mockResolvedValue({ correct: false });
		const image = await renderBoard();

		clickImageCenter(image);
		await user.click(screen.getByRole("button", { name: "yellow-cap" }));

		expect(
			await screen.findByText("Not there, keep looking!"),
		).toBeInTheDocument();
		expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
	});

	it("places a marker and removes the target from the menu on a hit", async () => {
		const user = userEvent.setup();
		submitGuess.mockResolvedValue({
			correct: true,
			location: { x: 0.5, y: 0.5 },
			finished: false,
		});
		const image = await renderBoard();

		clickImageCenter(image);
		await user.click(screen.getByRole("button", { name: "yellow-cap" }));

		expect(await screen.findByTestId("marker")).toBeInTheDocument();

		await user.click(image);
		expect(getMenuButton("yellow-cap")).not.toBeInTheDocument();
		expect(getMenuButton("big-curls")).toBeInTheDocument();
	});

	it("opens the score modal with the server's time when finished", async () => {
		const user = userEvent.setup();
		submitGuess.mockResolvedValue({
			correct: true,
			location: { x: 0.5, y: 0.5 },
			finished: true,
			timeMs: 12345,
		});
		const image = await renderBoard();

		clickImageCenter(image);
		await user.click(screen.getByRole("button", { name: "yellow-cap" }));

		expect(await screen.findByText("Your time: 12.3s")).toBeInTheDocument();
		expect(
			screen.getByLabelText("Name for the leaderboard"),
		).toBeInTheDocument();
	});
});
