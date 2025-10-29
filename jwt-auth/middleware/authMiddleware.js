import { verifyToken } from "../utils/tokenUtils.js";

// Middleware to protect routes
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }

  req.user = decoded; // Attach decoded user info to request
  next();
};
