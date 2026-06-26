import pool from "../db/connection.js";

function mapGoal(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    targetValue: row.target_value === null ? null : Number(row.target_value),
    unit: row.unit,
    period: row.period,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getGoals(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM goals
       WHERE user_id = ?
       ORDER BY FIELD(status, 'active', 'paused', 'completed'), created_at DESC`,
      [req.user.id]
    );

    return res.json(rows.map(mapGoal));
  } catch (err) {
    return next(err);
  }
}

export async function createGoal(req, res, next) {
  try {
    const { title, category = "wellness", targetValue = null, unit = "", period = "daily", status = "active" } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Goal title is required." });
    }

    const [result] = await pool.execute(
      `INSERT INTO goals (user_id, title, category, target_value, unit, period, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, category, targetValue, unit, period, status]
    );
    const [[goal]] = await pool.execute("SELECT * FROM goals WHERE id = ? AND user_id = ?", [
      result.insertId,
      req.user.id
    ]);

    return res.status(201).json(mapGoal(goal));
  } catch (err) {
    return next(err);
  }
}

export async function updateGoal(req, res, next) {
  try {
    const { title, category, targetValue, unit, period, status } = req.body;
    const [result] = await pool.execute(
      `UPDATE goals
       SET title = COALESCE(?, title),
           category = COALESCE(?, category),
           target_value = COALESCE(?, target_value),
           unit = COALESCE(?, unit),
           period = COALESCE(?, period),
           status = COALESCE(?, status)
       WHERE id = ? AND user_id = ?`,
      [title ?? null, category ?? null, targetValue ?? null, unit ?? null, period ?? null, status ?? null, req.params.id, req.user.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Goal not found." });
    }

    const [[goal]] = await pool.execute("SELECT * FROM goals WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id
    ]);

    return res.json(mapGoal(goal));
  } catch (err) {
    return next(err);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    const [result] = await pool.execute("DELETE FROM goals WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Goal not found." });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
