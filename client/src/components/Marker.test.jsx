import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Marker from "./Marker";

describe("Marker", () => {
	it("positions itself at the given coordinates as percentages", () => {
		render(<Marker x={0.25} y={0.75} />);

		expect(screen.getByTestId("marker")).toHaveStyle({
			left: "25%",
			top: "75%",
		});
	});
});