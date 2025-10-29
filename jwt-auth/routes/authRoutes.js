import express from "express";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/tokenUtils.js";

const router = express.Router();

// Dummy in-memory user storage (for demo)
const users = [];

// Signup route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.json({ message: "User registered successfully" });
});

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken({ username });
  res.json({ message: "Login successful", token });
});

// Protected route example
router.get("/profile", (req, res) => {
  res.json({ message: "This route should be protected!" });
});

export default router;
