import { verifyToken } from "../services/auth.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return res.status(401).json({ error: "Missing Authorization: Bearer <token>" });
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  const payload = verifyToken(token, secret);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });
  req.user = payload;
  next();
}

