import { describe, it, expect } from "vitest";
import { getRelativeCoords } from "./coords";

describe("getRelativeCoords", () => {
	it("returns 0.5, 0.5 for a click in the center", () => {
		const rect = { left: 0, top: 0, width: 800, height: 600 };
		expect(getRelativeCoords(400, 300, rect)).toEqual({ x: 0.5, y: 0.5 });
	});

	it("accounts for the image's offset on the page", () => {
		const rect = { left: 100, top: 50, width: 800, height: 600 };
		expect(getRelativeCoords(500, 350, rect)).toEqual({ x: 0.5, y: 0.5 });
	});

	it("returns the same fractions at a different display size", () => {
		const rect = { left: 0, top: 0, width: 400, height: 300 };
		expect(getRelativeCoords(200, 150, rect)).toEqual({ x: 0.5, y: 0.5 });
	});

	it("handles fractions that don't divide evenly", () => {
		const rect = { left: 0, top: 0, width: 300, height: 300 };
		const { x, y } = getRelativeCoords(100, 200, rect);
		expect(x).toBeCloseTo(1 / 3);
		expect(y).toBeCloseTo(2 / 3);
	});
});