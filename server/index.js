import express from "express";
import cors from "cors";
import gamesRouter from "./routes/games.js";
import imagesRouter from "./routes/images.js";

const app = express();

app.use(
	cors({
		origin: [process.env.CLIENT_ORIGIN],
	}),
);
app.use(express.json());

app.use("/games", gamesRouter);
app.use("/images", imagesRouter);

app.use((req, res) => {
	res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: "Something went wrong." });
});

app.listen(process.env.PORT || 8080, () => {
	console.log("Server running");
});
