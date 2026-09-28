import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Leaderboard from "./Leaderboard";
import { getScores } from "../api";

vi.mock("../api", () => ({
	getScores: vi.fn(),
}));

const SCORES = [
	{ id: "game-1", playerName: "Ana", timeMs: 10000 },
	{ id: "game-2", playerName: "Claudia", timeMs: 20500 },
];

beforeEach(() => {
	vi.clearAllMocks();
});

describe("Leaderboard", () => {
	it("fetches the scores for the given image", async () => {
		getScores.mockResolvedValue({ scores: SCORES });
		render(<Leaderboard imageId={3} currentGameId={null} />);

		await screen.findByRole("list");
		expect(getScores).toHaveBeenCalledWith(3);
	});

	it("shows a loading message while fetching", () => {
		getScores.mockReturnValue(new Promise(() => {}));
		render(<Leaderboard imageId={1} currentGameId={null} />);

		expect(screen.getByText("Loading leaderboard…")).toBeInTheDocument();
	});

	it("lists the scores in the order the server returns them", async () => {
		getScores.mockResolvedValue({ scores: SCORES });
		render(<Leaderboard imageId={1} currentGameId={null} />);

		const items = await screen.findAllByRole("listitem");
		expect(items).toHaveLength(2);
		expect(items[0]).toHaveTextContent("Ana: 10.0s");
		expect(items[1]).toHaveTextContent("Claudia: 20.5s");
	});

	it("marks the current player's entry", async () => {
		getScores.mockResolvedValue({ scores: SCORES });
		render(<Leaderboard imageId={1} currentGameId="game-2" />);

		const items = await screen.findAllByRole("listitem");
		expect(items[1]).toHaveTextContent("(you)");
		expect(items[1]).toHaveAttribute("aria-current", "true");
		expect(items[0]).not.toHaveAttribute("aria-current");
	});

	it("shows a message when there are no scores", async () => {
		getScores.mockResolvedValue({ scores: [] });
		render(<Leaderboard imageId={1} currentGameId={null} />);

		expect(await screen.findByText("No scores yet.")).toBeInTheDocument();
	});

	it("shows an error if the scores can't be loaded", async () => {
		getScores.mockRejectedValue(new Error("Server down"));
		render(<Leaderboard imageId={1} currentGameId={null} />);

		expect(
			await screen.findByText("Couldn't load the leaderboard: Server down"),
		).toBeInTheDocument();
	});
});