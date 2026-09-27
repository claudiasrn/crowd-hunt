import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TargetBox from "./TargetBox";

describe("TargetBox", () => {
	it("positions itself at the given coordinates as percentages", () => {
		render(<TargetBox x={0.25} y={0.75} />);

		expect(screen.getByTestId("target-box")).toHaveStyle({
			left: "25%",
			top: "75%",
		});
	});

	it("handles the edges of the image", () => {
		render(<TargetBox x={0} y={1} />);

		expect(screen.getByTestId("target-box")).toHaveStyle({
			left: "0%",
			top: "100%",
		});
	});
});