import { Router } from "express";
import { addFood, deleteFood, getTodayFood } from "../controllers/foodController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/", addFood);
router.get("/today", getTodayFood);
router.delete("/:id", deleteFood);

export default router;
