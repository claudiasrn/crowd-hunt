import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterMenu from "./CharacterMenu";

const TARGETS = [
	{ id: 1, name: "yellow-cap", thumbnail: "/images/targets/yellow-cap.jpg" },
	{ id: 2, name: "big-curls", thumbnail: "/images/targets/big-curls.jpg" },
	{ id: 3, name: "orange-brim", thumbnail: "/images/targets/orange-brim.jpg" },
];

describe("CharacterMenu", () => {
	it("renders one button per target", () => {
		render(<CharacterMenu x={0.5} y={0.5} targets={TARGETS} onSelect={() => {}} />);

		expect(screen.getAllByRole("button")).toHaveLength(3);
	});

	it("shows each target's thumbnail", () => {
		render(<CharacterMenu x={0.5} y={0.5} targets={TARGETS} onSelect={() => {}} />);

		expect(screen.getByAltText("yellow-cap")).toHaveAttribute(
			"src",
			"/images/targets/yellow-cap.jpg",
		);
	});

	it("renders nothing selectable when there are no targets", () => {
		render(<CharacterMenu x={0.5} y={0.5} targets={[]} onSelect={() => {}} />);

		expect(screen.queryAllByRole("button")).toHaveLength(0);
	});

	it("calls onSelect with the clicked target's id", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(<CharacterMenu x={0.5} y={0.5} targets={TARGETS} onSelect={onSelect} />);

		await user.click(screen.getByRole("button", { name: "big-curls" }));

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(2);
	});
});