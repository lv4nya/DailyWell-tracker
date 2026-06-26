import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import fastingRoutes from "./routes/fastingRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import waterRoutes from "./routes/waterRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "dailywell-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/fasting", fastingRoutes);
app.use("/api/goals", goalRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong."
  });
});

export default app;
