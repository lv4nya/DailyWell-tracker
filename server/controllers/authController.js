import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connection.js";

const jwtSecret = process.env.JWT_SECRET || "dailywell-dev-secret-change-me";

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email
    },
    jwtSecret,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, email, and a 6+ character password are required." });
    }

    const [existing] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    const user = { id: result.insertId, name, email };
    return res.status(201).json({ user: publicUser(user), token: createToken(user) });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [rows] = await pool.execute(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email]
    );
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({ user: publicUser(user), token: createToken(user) });
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res, next) {
  try {
    const [rows] = await pool.execute("SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?", [
      req.user.id
    ]);

    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    return next(err);
  }
}
