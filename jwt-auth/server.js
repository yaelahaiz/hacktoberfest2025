import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();

app.use(express.json());

// Public routes
app.use("/auth", authRoutes);

// Example of a protected route
app.get("/secret", authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, you accessed a secret route!` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
