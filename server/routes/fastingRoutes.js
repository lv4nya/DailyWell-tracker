import { Router } from "express";
import { endFasting, getFastingHistory, startFasting } from "../controllers/fastingController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/start", startFasting);
router.patch("/:id/end", endFasting);
router.get("/history", getFastingHistory);

export default router;
