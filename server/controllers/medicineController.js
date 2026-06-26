import pool from "../db/connection.js";

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

async function getSupplementTarget(userId) {
  const [[goal]] = await pool.execute(
    `SELECT target_value AS targetValue
     FROM goals
     WHERE user_id = ?
       AND category = 'medicine'
       AND period = 'daily'
       AND status = 'active'
     ORDER BY updated_at DESC
     LIMIT 1`,
    [userId]
  );
  const [medicines] = await pool.execute(
    "SELECT id, name FROM medicines WHERE user_id = ? AND is_active = TRUE ORDER BY schedule_time IS NULL, schedule_time, id",
    [userId]
  );

  return {
    medicines,
    target: Number(goal?.targetValue || Math.max(medicines.length, 3))
  };
}

export async function getSupplementProgress(req, res, next) {
  try {
    const { medicines, target } = await getSupplementTarget(req.user.id);
    const [[today]] = await pool.execute(
      `SELECT COUNT(DISTINCT medicine_id) AS completed
       FROM medicine_logs
       WHERE user_id = ?
         AND status = 'taken'
         AND DATE(logged_at) = CURDATE()`,
      [req.user.id]
    );

    return res.json({
      completed: Math.min(Number(today.completed), target),
      target,
      medicines: medicines.map((medicine) => ({
        id: medicine.id,
        name: medicine.name
      }))
    });
  } catch (err) {
    return next(err);
  }
}

export async function completeSupplement(req, res, next) {
  try {
    const { medicines, target } = await getSupplementTarget(req.user.id);
    const [completedRows] = await pool.execute(
      `SELECT DISTINCT medicine_id
       FROM medicine_logs
       WHERE user_id = ?
         AND status = 'taken'
         AND DATE(logged_at) = CURDATE()`,
      [req.user.id]
    );
    const completedIds = new Set(completedRows.map((row) => row.medicine_id));

    if (completedIds.size >= target) {
      return res.status(409).json({
        message: "All supplements are completed for today.",
        completed: target,
        target
      });
    }

    let nextMedicine = medicines.find((medicine) => !completedIds.has(medicine.id));

    if (!nextMedicine) {
      const [result] = await pool.execute(
        "INSERT INTO medicines (user_id, name, dosage, notes) VALUES (?, ?, ?, ?)",
        [req.user.id, `Supplement ${completedIds.size + 1}`, "1 dose", "Auto-created from dashboard completion"]
      );
      nextMedicine = {
        id: result.insertId,
        name: `Supplement ${completedIds.size + 1}`
      };
    }

    await pool.execute(
      "INSERT INTO medicine_logs (user_id, medicine_id, status, note) VALUES (?, ?, 'taken', ?)",
      [req.user.id, nextMedicine.id, "Completed from dashboard"]
    );

    return res.status(201).json({
      completed: completedIds.size + 1,
      target,
      medicine: nextMedicine
    });
  } catch (err) {
    return next(err);
  }
}
