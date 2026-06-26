import pool from "../db/pool.js";

function mapMedicine(row) {
  return {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    scheduleTime: row.schedule_time,
    notes: row.notes,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at
  };
}

function mapMedicineLog(row) {
  return {
    id: row.id,
    medicineId: row.medicine_id,
    medicineName: row.medicine_name,
    status: row.status,
    note: row.note,
    loggedAt: row.logged_at
  };
}

export async function addMedicine(req, res, next) {
  try {
    const { name, dosage = "", scheduleTime = null, notes = "" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Medicine name is required." });
    }

    const [result] = await pool.execute(
      "INSERT INTO medicines (user_id, name, dosage, schedule_time, notes) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, name, dosage, scheduleTime, notes]
    );
    const [[medicine]] = await pool.execute("SELECT * FROM medicines WHERE id = ? AND user_id = ?", [
      result.insertId,
      req.user.id
    ]);

    return res.status(201).json(mapMedicine(medicine));
  } catch (err) {
    return next(err);
  }
}

export async function getMedicines(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM medicines
       WHERE user_id = ? AND is_active = TRUE
       ORDER BY schedule_time IS NULL, schedule_time, name`,
      [req.user.id]
    );

    return res.json(rows.map(mapMedicine));
  } catch (err) {
    return next(err);
  }
}

export async function logMedicineStatus(req, res, next) {
  try {
    const { medicineId, status, note = "", loggedAt = null } = req.body;
    const allowedStatuses = ["taken", "skipped", "missed"];

    if (!medicineId || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Medicine ID and a valid status are required." });
    }

    const [[medicine]] = await pool.execute("SELECT id FROM medicines WHERE id = ? AND user_id = ?", [
      medicineId,
      req.user.id
    ]);

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    const [result] = await pool.execute(
      `INSERT INTO medicine_logs (user_id, medicine_id, status, note, logged_at)
       VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
      [req.user.id, medicineId, status, note, loggedAt]
    );
    const [[log]] = await pool.execute(
      `SELECT ml.*, m.name AS medicine_name
       FROM medicine_logs ml
       JOIN medicines m ON m.id = ml.medicine_id
       WHERE ml.id = ? AND ml.user_id = ?`,
      [result.insertId, req.user.id]
    );

    return res.status(201).json(mapMedicineLog(log));
  } catch (err) {
    return next(err);
  }
}

export async function getMedicineStatus(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT ml.*, m.name AS medicine_name
       FROM medicine_logs ml
       JOIN medicines m ON m.id = ml.medicine_id
       WHERE ml.user_id = ? AND DATE(ml.logged_at) = CURDATE()
       ORDER BY ml.logged_at DESC`,
      [req.user.id]
    );

    return res.json(rows.map(mapMedicineLog));
  } catch (err) {
    return next(err);
  }
}
