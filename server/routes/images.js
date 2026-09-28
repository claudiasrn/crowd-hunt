import { Router } from "express";
import { getScores } from "../controllers/imagesController.js";

const router = Router();

router.get("/:id/scores", getScores);

export default router;