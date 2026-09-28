import { prisma } from "../db/prisma.js";
import { images } from "./seedData.js";

async function main() {
	await prisma.gameTarget.deleteMany();
	await prisma.game.deleteMany();
	await prisma.character.deleteMany();
	await prisma.image.deleteMany();

	for (const image of images) {
		await prisma.image.create({
			data: {
				name: image.name,
				url: image.url,
				width: image.width,
				height: image.height,
				characters: {
					create: image.characters.map((c) => ({
						name: c.name,
						x: c.x,
						y: c.y,
						thumbnail: `/images/targets/${c.name}.jpg`,
					})),
				},
			},
		});
	}

	console.log(`Seeded ${images.length} images`);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});