import { Router } from "express";
import {
  addMedicine,
  getMedicines,
  getMedicineStatus,
  logMedicineStatus
} from "../controllers/medicineController.js";
import requireAuth from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/", addMedicine);
router.get("/", getMedicines);
router.post("/logs", logMedicineStatus);
router.get("/status", getMedicineStatus);

export default router;
