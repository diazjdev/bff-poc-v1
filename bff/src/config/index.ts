import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  auth: {
    serviceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:3001",
  },
  downstream: {
    apiUrl: process.env.DOWNSTREAM_API_URL || "http://localhost:4000",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
  },
};
