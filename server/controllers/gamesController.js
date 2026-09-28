import { body, param, validationResult } from "express-validator";
import { prisma } from "../db/prisma.js";
import { pickRandom } from "../utils/pickRandom.js";
import { isHit } from "../utils/isHit.js";

const TARGET_COUNT = 3;
const HIT_RADIUS_PX = 100;
const NAME_MAX_LENGTH = 20;

function validate(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	next();
}

const validateGameId = param("id").isUUID().withMessage("Invalid game id");

const validateCreateGame = [
	body("imageId")
		.isInt({ min: 1 })
		.withMessage("imageId must be a positive integer")
		.toInt(),
];

const validateGuess = [
	validateGameId,
	body("characterId")
		.isInt({ min: 1 })
		.withMessage("characterId must be a positive integer")
		.toInt(),
	body("x")
		.isFloat({ min: 0, max: 1 })
		.withMessage("x must be between 0 and 1")
		.toFloat(),
	body("y")
		.isFloat({ min: 0, max: 1 })
		.withMessage("y must be between 0 and 1")
		.toFloat(),
];

const validateName = [
	validateGameId,
	body("name")
		.isString()
		.withMessage("name must be a string")
		.trim()
		.isLength({ min: 1, max: NAME_MAX_LENGTH })
		.withMessage(`name must be 1-${NAME_MAX_LENGTH} characters`),
];

export const createGame = [
	...validateCreateGame,
	validate,
	async (req, res) => {
		const { imageId } = req.body;

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
	},
];

export const submitGuess = [
	...validateGuess,
	validate,
	async (req, res) => {
		const { id } = req.params;
		const { characterId, x, y } = req.body;

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
			return res
				.status(400)
				.json({ message: "Character is not a target in this game" });
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
	},
];

export const submitName = [
	...validateName,
	validate,
	async (req, res) => {
		const { id } = req.params;
		const { name } = req.body;

		const game = await prisma.game.findUnique({ where: { id } });

		if (!game) {
			return res.status(404).json({ message: "Game not found" });
		}

		if (!game.endedAt) {
			return res.status(409).json({ message: "Game is not finished" });
		}

		if (game.playerName) {
			return res.status(409).json({ message: "Name already submitted" });
		}

		const { count } = await prisma.game.updateMany({
			where: { id, playerName: null },
			data: { playerName: name },
		});

		if (count === 0) {
			return res.status(409).json({ message: "Name already submitted" });
		}

		res.json({
			playerName: name,
			timeMs: game.endedAt - game.startedAt,
		});
	},
];
