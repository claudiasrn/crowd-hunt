import request from "supertest";
import express from "express";
import imagesRouter from "./images.js";

const app = express();
app.use(express.json());
app.use("/images", imagesRouter);

describe("GET /images/:id/scores validation", () => {
	test("rejects a non-integer image id", async () => {
		await request(app).get("/images/abc/scores").expect(400);
	});
});