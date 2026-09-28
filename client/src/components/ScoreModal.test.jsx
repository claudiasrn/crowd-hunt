// src/components/ScoreModal.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ScoreModal from "./ScoreModal";
import { submitName } from "../api";

vi.mock("../api", () => ({
	submitName: vi.fn(),
}));

function renderModal(onSubmitted = vi.fn()) {
	render(
		<ScoreModal gameId="game-1" timeMs={12345} onSubmitted={onSubmitted} />,
	);
	return onSubmitted;
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("ScoreModal", () => {
	it("opens as a modal on mount", () => {
		renderModal();
		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
	});

	it("shows the time", () => {
		renderModal();
		expect(screen.getByText("Your time: 12.3s")).toBeInTheDocument();
	});

	it("disables saving until a name is entered", async () => {
		const user = userEvent.setup();
		renderModal();
		const button = screen.getByRole("button", { name: "Save score" });

		expect(button).toBeDisabled();

		await user.type(screen.getByLabelText("Name for the leaderboard"), "   ");
		expect(button).toBeDisabled();

		await user.type(screen.getByLabelText("Name for the leaderboard"), "Claudia");
		expect(button).toBeEnabled();
	});

	it("submits the name and reports the saved name", async () => {
		const user = userEvent.setup();
		submitName.mockResolvedValue({ playerName: "Claudia", timeMs: 12345 });
		const onSubmitted = renderModal();

		await user.type(screen.getByLabelText("Name for the leaderboard"), "Claudia");
		await user.click(screen.getByRole("button", { name: "Save score" }));

		expect(submitName).toHaveBeenCalledWith("game-1", "Claudia");
		expect(onSubmitted).toHaveBeenCalledWith("Claudia");
	});

	it("shows the server's error and keeps the modal open", async () => {
		const user = userEvent.setup();
		submitName.mockRejectedValue(new Error("Name already submitted"));
		const onSubmitted = renderModal();

		await user.type(screen.getByLabelText("Name for the leaderboard"), "Claudia");
		await user.click(screen.getByRole("button", { name: "Save score" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Name already submitted",
		);
		expect(onSubmitted).not.toHaveBeenCalled();
	});
});