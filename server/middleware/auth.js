import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "dailywell-dev-secret-change-me";

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export default requireAuth;
