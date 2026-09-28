import { describe, it, expect } from "vitest";
import { formatTime } from "./formatTime";

describe("formatTime", () => {
	it("formats zero", () => {
		expect(formatTime(0)).toBe("0.0s");
	});

	it("formats milliseconds as seconds with one decimal", () => {
		expect(formatTime(12345)).toBe("12.3s");
	});

	it("rounds up to the next tenth", () => {
		expect(formatTime(59999)).toBe("60.0s");
	});

	it("handles times over a minute in seconds", () => {
		expect(formatTime(125000)).toBe("125.0s");
	});
});