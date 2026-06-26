import { Router } from "express";
import { addWater, deleteWater, getTodayWater } from "../controllers/waterController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/", addWater);
router.get("/today", getTodayWater);
router.delete("/:id", deleteWater);

export default router;
