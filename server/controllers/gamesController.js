import { prisma } from "../db/prisma.js";
import { pickRandom } from "../utils/pickRandom.js";

const TARGET_COUNT = 3;

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