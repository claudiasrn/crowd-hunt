import { Router } from "express";
import { getScores, listImages } from "../controllers/imagesController.js";

const router = Router();

router.get("/", listImages);
router.get("/:id/scores", getScores);

export default router;