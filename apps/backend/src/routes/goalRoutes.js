import { Router } from "express";
import { createGoal, deleteGoal, getGoals, updateGoal } from "../controllers/goalController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
