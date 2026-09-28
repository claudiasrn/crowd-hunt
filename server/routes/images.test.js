import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

jest.unstable_mockModule("../db/prisma.js", () => ({
	prisma: {
		image: {
			findMany: jest.fn(),
			findUnique: jest.fn(),
		},
		game: {
			findMany: jest.fn(),
		},
	},
}));

const { prisma } = await import("../db/prisma.js");
const { default: imagesRouter } = await import("./images.js");

const app = express();
app.use(express.json());
app.use("/images", imagesRouter);

beforeEach(() => {
	jest.clearAllMocks();
});

describe("GET /images", () => {
	test("returns the images from the database", async () => {
		const images = [
			{ id: 1, name: "Front Row", url: "/images/front-row.jpg" },
			{ id: 2, name: "Grandstand", url: "/images/grandstand.jpg" },
		];
		prisma.image.findMany.mockResolvedValue(images);

		const res = await request(app).get("/images").expect(200);

		expect(res.body).toEqual({ images });
	});

	test("only selects the fields the picker needs", async () => {
		prisma.image.findMany.mockResolvedValue([]);

		await request(app).get("/images").expect(200);

		expect(prisma.image.findMany).toHaveBeenCalledWith({
			select: { id: true, name: true, url: true },
			orderBy: { id: "asc" },
		});
	});
});

describe("GET /images/:id/scores validation", () => {
	test("rejects a non-integer image id", async () => {
		await request(app).get("/images/abc/scores").expect(400);
		expect(prisma.image.findUnique).not.toHaveBeenCalled();
	});
});