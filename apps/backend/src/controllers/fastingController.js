import pool from "../db/pool.js";

function mapFastingSession(row) {
  return {
    id: row.id,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    note: row.note,
    createdAt: row.created_at
  };
}

export async function startFasting(req, res, next) {
  try {
    const { startTime = null, note = "" } = req.body;
    const [[active]] = await pool.execute(
      "SELECT id FROM fasting_sessions WHERE user_id = ? AND status = 'active' LIMIT 1",
      [req.user.id]
    );

    if (active) {
      return res.status(409).json({ message: "An active fasting session already exists." });
    }

    const [result] = await pool.execute(
      "INSERT INTO fasting_sessions (user_id, start_time, note) VALUES (?, COALESCE(?, CURRENT_TIMESTAMP), ?)",
      [req.user.id, startTime, note]
    );
    const [[session]] = await pool.execute("SELECT * FROM fasting_sessions WHERE id = ? AND user_id = ?", [
      result.insertId,
      req.user.id
    ]);

    return res.status(201).json(mapFastingSession(session));
  } catch (err) {
    return next(err);
  }
}

export async function endFasting(req, res, next) {
  try {
    const { endTime = null, note = null } = req.body;
    const [result] = await pool.execute(
      `UPDATE fasting_sessions
       SET end_time = COALESCE(?, CURRENT_TIMESTAMP),
           status = 'completed',
           note = COALESCE(?, note)
       WHERE id = ? AND user_id = ? AND status = 'active'`,
      [endTime, note, req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Active fasting session not found." });
    }

    const [[session]] = await pool.execute("SELECT * FROM fasting_sessions WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id
    ]);

    return res.json(mapFastingSession(session));
  } catch (err) {
    return next(err);
  }
}

export async function getFastingHistory(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM fasting_sessions
       WHERE user_id = ?
       ORDER BY start_time DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.json(rows.map(mapFastingSession));
  } catch (err) {
    return next(err);
  }
}
