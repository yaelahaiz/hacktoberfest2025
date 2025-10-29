import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwtConfig.js";

// Generate JWT Token
export const generateToken = (payload) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

// Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};
