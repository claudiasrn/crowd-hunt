import express from "express";
import gamesRouter from "../routes/games.js";
import imagesRouter from "../routes/images.js";

export function buildApp() {
	const app = express();
	app.use(express.json());
	app.use("/games", gamesRouter);
	app.use("/images", imagesRouter);
	return app;
}