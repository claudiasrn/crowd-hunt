import { Router } from "express";
import { createGame, submitGuess } from "../controllers/gamesController.js";

const router = Router();

router.post("/", createGame);
router.post("/:id/guesses", submitGuess);

export default router;