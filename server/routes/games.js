import { Router } from "express";
import {
	createGame,
	submitGuess,
	submitName,
} from "../controllers/gamesController.js";

const router = Router();

router.post("/", createGame);
router.post("/:id/guesses", submitGuess);
router.patch("/:id", submitName);

export default router;
