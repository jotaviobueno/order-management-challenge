import dotenv from "dotenv";

dotenv.config();

const jwtSecret: string = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const jwtExpiresIn: string = process.env.JWT_EXPIRES_IN || "7d";

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/order-management",
  jwt: {
    secret: jwtSecret,
    expiresIn: jwtExpiresIn,
  },
};
