import request from "supertest";
import { prisma } from "../db/prisma.js";
import { buildApp } from "./buildApp.js";

if (!process.env.DATABASE_URL?.includes("_test")) {
	throw new Error("Refusing to run: DATABASE_URL is not a test database");
}

const app = buildApp();

const CHARACTERS = [
	{ name: "a", x: 0.1, y: 0.1 },
	{ name: "b", x: 0.3, y: 0.3 },
	{ name: "c", x: 0.5, y: 0.5 },
	{ name: "d", x: 0.7, y: 0.7 },
];

const MISS = { x: 0.95, y: 0.05 };
const UNKNOWN_GAME_ID = "00000000-0000-4000-8000-000000000000";

let image;
let coordsById;

beforeEach(async () => {
	await prisma.gameTarget.deleteMany();
	await prisma.game.deleteMany();
	await prisma.character.deleteMany();
	await prisma.image.deleteMany();

	image = await prisma.image.create({
		data: {
			name: "Test Image",
			url: "/images/test.jpg",
			width: 1000,
			height: 1000,
			characters: {
				create: CHARACTERS.map((c) => ({
					...c,
					thumbnail: `/images/targets/${c.name}.jpg`,
				})),
			},
		},
		include: { characters: true },
	});

	coordsById = new Map(image.characters.map((c) => [c.id, { x: c.x, y: c.y }]));
});

afterAll(async () => {
	await prisma.$disconnect();
});

async function startGame() {
	const res = await request(app)
		.post("/games")
		.send({ imageId: image.id })
		.expect(201);
	return res.body;
}

function guess(gameId, characterId, coords) {
	return request(app)
		.post(`/games/${gameId}/guesses`)
		.send({ characterId, ...coords });
}

async function findAll(game) {
	let res;
	for (const t of game.targets) {
		res = await guess(game.gameId, t.id, coordsById.get(t.id)).expect(200);
	}
	return res;
}

describe("POST /games", () => {
	test("starts a game with 3 targets and hides their coordinates", async () => {
		const game = await startGame();

		expect(game.gameId).toEqual(expect.any(String));
		expect(game.image.url).toBe("/images/test.jpg");
		expect(game.targets).toHaveLength(3);
		game.targets.forEach((t) => {
			expect(t).not.toHaveProperty("x");
			expect(t).not.toHaveProperty("y");
		});

		const rows = await prisma.gameTarget.count({ where: { gameId: game.gameId } });
		expect(rows).toBe(3);
	});

	test("returns 404 for an image that doesn't exist", async () => {
		await request(app)
			.post("/games")
			.send({ imageId: image.id + 1000 })
			.expect(404);
	});
});

describe("POST /games/:id/guesses", () => {
	test("returns 404 for a game that doesn't exist", async () => {
		await guess(UNKNOWN_GAME_ID, 1, { x: 0.5, y: 0.5 }).expect(404);
	});

	test("reports a miss without ending anything", async () => {
		const game = await startGame();
		const targetId = game.targets[0].id;

		const res = await guess(game.gameId, targetId, MISS).expect(200);

		expect(res.body).toEqual({ correct: false });
	});

	test("reports a hit with the character's stored location", async () => {
		const game = await startGame();
		const targetId = game.targets[0].id;
		const coords = coordsById.get(targetId);

		const res = await guess(game.gameId, targetId, {
			x: coords.x + 0.05,
			y: coords.y - 0.05,
		}).expect(200);

		expect(res.body).toEqual({ correct: true, location: coords, finished: false });
	});

	test("rejects finding the same target twice", async () => {
		const game = await startGame();
		const targetId = game.targets[0].id;
		const coords = coordsById.get(targetId);

		await guess(game.gameId, targetId, coords).expect(200);
		await guess(game.gameId, targetId, coords).expect(409);
	});

	test("rejects a character that isn't a target in this game", async () => {
		const game = await startGame();
		const targetIds = new Set(game.targets.map((t) => t.id));
		const other = image.characters.find((c) => !targetIds.has(c.id));

		await guess(game.gameId, other.id, { x: other.x, y: other.y }).expect(400);
	});
});

describe("full game flow", () => {
	test("finish, submit a name, and appear on the leaderboard", async () => {
		const game = await startGame();

		const last = await findAll(game);
		expect(last.body.finished).toBe(true);
		expect(last.body.timeMs).toEqual(expect.any(Number));

		const target = game.targets[0];
		await guess(game.gameId, target.id, coordsById.get(target.id)).expect(409);

		const named = await request(app)
			.patch(`/games/${game.gameId}`)
			.send({ name: "  Claudia  " })
			.expect(200);
		expect(named.body.playerName).toBe("Claudia");

		await request(app)
			.patch(`/games/${game.gameId}`)
			.send({ name: "Someone else" })
			.expect(409);

		const scores = await request(app)
			.get(`/images/${image.id}/scores`)
			.expect(200);
		expect(scores.body.scores).toHaveLength(1);
		expect(scores.body.scores[0]).toMatchObject({
			playerName: "Claudia",
			timeMs: last.body.timeMs,
		});
	});

	test("rejects a name before the game is finished", async () => {
		const game = await startGame();

		await request(app)
			.patch(`/games/${game.gameId}`)
			.send({ name: "Claudia" })
			.expect(409);
	});

	test("leaves unnamed and unfinished games off the leaderboard", async () => {
		await startGame();
		const finished = await startGame();
		await findAll(finished);

		const scores = await request(app)
			.get(`/images/${image.id}/scores`)
			.expect(200);
		expect(scores.body.scores).toHaveLength(0);
	});
});