import pool from "../db/pool.js";

function mapFoodLog(row) {
  return {
    id: row.id,
    mealType: row.meal_type,
    foodName: row.food_name,
    calories: row.calories,
    note: row.note,
    loggedAt: row.logged_at
  };
}

export async function addFood(req, res, next) {
  try {
    const { mealType = "other", foodName, calories = null, note = "", loggedAt = null } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: "Food name is required." });
    }

    const [result] = await pool.execute(
      `INSERT INTO food_logs (user_id, meal_type, food_name, calories, note, logged_at)
       VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
      [req.user.id, mealType, foodName, calories, note, loggedAt]
    );
    const [[log]] = await pool.execute("SELECT * FROM food_logs WHERE id = ? AND user_id = ?", [
      result.insertId,
      req.user.id
    ]);

    return res.status(201).json(mapFoodLog(log));
  } catch (err) {
    return next(err);
  }
}

export async function getTodayFood(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT *
       FROM food_logs
       WHERE user_id = ? AND DATE(logged_at) = CURDATE()
       ORDER BY logged_at DESC`,
      [req.user.id]
    );
    const totalCalories = rows.reduce((sum, row) => sum + Number(row.calories || 0), 0);

    return res.json({ totalCalories, logs: rows.map(mapFoodLog) });
  } catch (err) {
    return next(err);
  }
}

export async function deleteFood(req, res, next) {
  try {
    const [result] = await pool.execute("DELETE FROM food_logs WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id
    ]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Food log not found." });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
