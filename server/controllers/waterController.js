import pool from "../db/connection.js";

function mapWaterLog(row) {
  return {
    id: row.id,
    amountMl: row.amount_ml,
    note: row.note,
    loggedAt: row.logged_at
  };
}

export async function addWater(req, res, next) {
  try {
    const { amountMl, note = "", loggedAt = null } = req.body;

    if (!amountMl || Number(amountMl) <= 0) {
      return res.status(400).json({ message: "A positive water amount is required." });
    }

    const [result] = await pool.execute(
      "INSERT INTO water_logs (user_id, amount_ml, note, logged_at) VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))",
      [req.user.id, Number(amountMl), note, loggedAt]
    );
    const [[log]] = await pool.execute("SELECT * FROM water_logs WHERE id = ? AND user_id = ?", [
      result.insertId,
      req.user.id
    ]);

    return res.status(201).json(mapWaterLog(log));
  } catch (err) {
    return next(err);
  }
}

export async function getTodayWater(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM water_logs
       WHERE user_id = ? AND DATE(logged_at) = CURDATE()
       ORDER BY logged_at DESC`,
      [req.user.id]
    );
    const totalMl = rows.reduce((sum, row) => sum + Number(row.amount_ml), 0);

    return res.json({ totalMl, logs: rows.map(mapWaterLog) });
  } catch (err) {
    return next(err);
  }
}

export async function deleteWater(req, res, next) {
  try {
    const [result] = await pool.execute("DELETE FROM water_logs WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Water log not found." });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
