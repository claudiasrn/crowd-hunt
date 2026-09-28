import { pickRandom } from "./pickRandom.js";

const items = [1, 2, 3, 4, 5, 6, 7, 8];

describe("pickRandom", () => {
	test("returns the requested number of items", () => {
		expect(pickRandom(items, 3)).toHaveLength(3);
	});

	test("only returns items from the original array", () => {
		const picked = pickRandom(items, 3);
		picked.forEach((item) => expect(items).toContain(item));
	});

	test("never returns duplicates", () => {
		const picked = pickRandom(items, 8);
		expect(new Set(picked).size).toBe(8);
	});

	test("does not mutate the original array", () => {
		const original = [...items];
		pickRandom(items, 3);
		expect(items).toEqual(original);
	});

	test("returns all items when count exceeds the length", () => {
		expect(pickRandom(items, 20)).toHaveLength(items.length);
	});
});