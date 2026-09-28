import request from "supertest";
import express from "express";
import gamesRouter from "./games.js";

const app = express();
app.use(express.json());
app.use("/games", gamesRouter);

const VALID_UUID = "47b4d81b-2389-4979-a94c-619cf62669bd";

describe("POST /games validation", () => {
	test("rejects a non-integer imageId", async () => {
		await request(app).post("/games").send({ imageId: "abc" }).expect(400);
	});

	test("rejects a missing imageId", async () => {
		await request(app).post("/games").send({}).expect(400);
	});
});

describe("POST /games/:id/guesses validation", () => {
	test("rejects a game id that is not a UUID", async () => {
		await request(app)
			.post("/games/not-a-uuid/guesses")
			.send({ characterId: 1, x: 0.5, y: 0.5 })
			.expect(400);
	});

	test("rejects coordinates outside 0-1", async () => {
		await request(app)
			.post(`/games/${VALID_UUID}/guesses`)
			.send({ characterId: 1, x: 1.5, y: 0.5 })
			.expect(400);
	});

	test("rejects a missing characterId", async () => {
		await request(app)
			.post(`/games/${VALID_UUID}/guesses`)
			.send({ x: 0.5, y: 0.5 })
			.expect(400);
	});
});

describe("PATCH /games/:id validation", () => {
	test("rejects an empty name", async () => {
		await request(app).patch(`/games/${VALID_UUID}`).send({ name: "" }).expect(400);
	});

	test("rejects a name that is only whitespace", async () => {
		await request(app).patch(`/games/${VALID_UUID}`).send({ name: "   " }).expect(400);
	});

	test("rejects a name longer than 20 characters", async () => {
		await request(app)
			.patch(`/games/${VALID_UUID}`)
			.send({ name: "a".repeat(21) })
			.expect(400);
	});
});