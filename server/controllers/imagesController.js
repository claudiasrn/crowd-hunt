import { param, validationResult } from "express-validator";
import { prisma } from "../db/prisma.js";

const LEADERBOARD_SIZE = 10;

function validate(req, res, next) {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	next();
}

const validateImageId = [
	param("id")
		.isInt({ min: 1 })
		.withMessage("Image id must be a positive integer")
		.toInt(),
];

export const getScores = [
	...validateImageId,
	validate,
	async (req, res) => {
		const { id } = req.params;

		const image = await prisma.image.findUnique({
			where: { id },
			select: { id: true },
		});

		if (!image) {
			return res.status(404).json({ message: "Image not found" });
		}

		const games = await prisma.game.findMany({
			where: {
				imageId: id,
				endedAt: { not: null },
				playerName: { not: null },
			},
			select: { id: true, playerName: true, startedAt: true, endedAt: true },
		});

		const scores = games
			.map((g) => ({
				id: g.id,
				playerName: g.playerName,
				timeMs: g.endedAt - g.startedAt,
				date: g.endedAt,
			}))
			.sort((a, b) => a.timeMs - b.timeMs)
			.slice(0, LEADERBOARD_SIZE);

		res.json({ scores });
	},
];

export async function listImages(req, res) {
	const images = await prisma.image.findMany({
		select: { id: true, name: true, url: true },
		orderBy: { id: "asc" },
	});

	res.json({ images });
}