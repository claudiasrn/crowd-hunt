import { isHit } from "./isHit.js";

const target = { x: 0.5, y: 0.5 };
const tolerance = { x: 0.02, y: 0.03 };

describe("isHit", () => {
	test("hits the exact center", () => {
		expect(isHit({ x: 0.5, y: 0.5 }, target, tolerance)).toBe(true);
	});

	test("hits inside the tolerance", () => {
		expect(isHit({ x: 0.51, y: 0.52 }, target, tolerance)).toBe(true);
	});

	test("hits exactly on the edge", () => {
		const edgeTarget = { x: 0.5, y: 0.5 };
		const edgeTolerance = { x: 0.25, y: 0.125 };
		expect(isHit({ x: 0.75, y: 0.625 }, edgeTarget, edgeTolerance)).toBe(true);
	});

	test("misses when too far on x", () => {
		expect(isHit({ x: 0.53, y: 0.5 }, target, tolerance)).toBe(false);
	});

	test("misses when too far on y", () => {
		expect(isHit({ x: 0.5, y: 0.54 }, target, tolerance)).toBe(false);
	});

	test("uses separate tolerances per axis", () => {
		// 0.025 is inside the y tolerance but outside the x tolerance
		expect(isHit({ x: 0.5, y: 0.525 }, target, tolerance)).toBe(true);
		expect(isHit({ x: 0.525, y: 0.5 }, target, tolerance)).toBe(false);
	});
});
