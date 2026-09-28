import express from "express";
import cors from "cors";

const app = express();

app.use(
	cors({
		origin: [process.env.CLIENT_ORIGIN],
	}),
);
app.use(express.json());

app.get("/", (req, res) => {
	res.json({ message: "hello" });
});

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
