import { prisma } from "../db/prisma.js";
import { pickRandom } from "../utils/pickRandom.js";
import { isHit } from "../utils/isHit.js";

const TARGET_COUNT = 3;
const HIT_RADIUS_PX = 100;

export async function createGame(req, res) {
	const imageId = Number(req.body?.imageId);

	if (!Number.isInteger(imageId)) {
		return res.status(400).json({ message: "imageId must be an integer" });
	}

	const image = await prisma.image.findUnique({
		where: { id: imageId },
		select: {
			url: true,
			characters: {
				select: { id: true, name: true, thumbnail: true },
			},
		},
	});

	if (!image) {
		return res.status(404).json({ message: "Image not found" });
	}

	const targets = pickRandom(image.characters, TARGET_COUNT);

	const game = await prisma.game.create({
		data: {
			imageId,
			targets: {
				create: targets.map((t) => ({ characterId: t.id })),
			},
		},
	});

	res.status(201).json({
		gameId: game.id,
		image: { url: image.url },
		targets,
	});
}

function isFraction(value) {
	return typeof value === "number" && value >= 0 && value <= 1;
}

export async function submitGuess(req, res) {
	const { id } = req.params;
	const characterId = Number(req.body?.characterId);
	const x = req.body?.x;
	const y = req.body?.y;

	if (!Number.isInteger(characterId)) {
		return res.status(400).json({ message: "characterId must be an integer" });
	}

	if (!isFraction(x) || !isFraction(y)) {
		return res.status(400).json({ message: "x and y must be numbers between 0 and 1" });
	}

	const game = await prisma.game.findUnique({
		where: { id },
		include: {
			image: { select: { width: true, height: true } },
			targets: {
				include: { character: { select: { x: true, y: true } } },
			},
		},
	});

	if (!game) {
		return res.status(404).json({ message: "Game not found" });
	}

	if (game.endedAt) {
		return res.status(409).json({ message: "Game already finished" });
	}

	const target = game.targets.find((t) => t.characterId === characterId);

	if (!target) {
		return res.status(400).json({ message: "Character is not a target in this game" });
	}

	if (target.foundAt) {
		return res.status(409).json({ message: "Character already found" });
	}

	const tolerance = {
		x: HIT_RADIUS_PX / game.image.width,
		y: HIT_RADIUS_PX / game.image.height,
	};

	if (!isHit({ x, y }, target.character, tolerance)) {
		return res.json({ correct: false });
	}

	await prisma.gameTarget.update({
		where: { gameId_characterId: { gameId: id, characterId } },
		data: { foundAt: new Date() },
	});

	const remaining = await prisma.gameTarget.count({
		where: { gameId: id, foundAt: null },
	});

	const location = { x: target.character.x, y: target.character.y };

	if (remaining > 0) {
		return res.json({ correct: true, location, finished: false });
	}

	const finishedGame = await prisma.game.update({
		where: { id },
		data: { endedAt: new Date() },
	});

	res.json({
		correct: true,
		location,
		finished: true,
		timeMs: finishedGame.endedAt - finishedGame.startedAt,
	});
}