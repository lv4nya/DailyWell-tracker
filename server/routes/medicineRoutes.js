import { Router } from "express";
import {
  addMedicine,
  completeSupplement,
  getMedicines,
  getMedicineStatus,
  getSupplementProgress,
  logMedicineStatus
} from "../controllers/medicineController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/", addMedicine);
router.get("/", getMedicines);
router.post("/logs", logMedicineStatus);
router.get("/status", getMedicineStatus);
router.get("/supplements/progress", getSupplementProgress);
router.post("/supplements/complete", completeSupplement);

export default router;
