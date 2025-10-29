// Configuration file for JWT secret and expiration time
export const jwtConfig = {
  secret: process.env.JWT_SECRET || "supersecretkey",
  expiresIn: "1h", // token expires in 1 hour
};
