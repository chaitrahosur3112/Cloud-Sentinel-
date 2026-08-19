import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),

  databaseUrl: required("DATABASE_URL"),
  redisUrl: required("REDIS_URL"),

  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: required("REFRESH_TOKEN_SECRET"),

  accessTokenExpiresIn:
    process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",

  refreshTokenExpiresIn:
    process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",

  frontendUrl:
    process.env.FRONTEND_URL ?? "http://localhost:3000",

  mlServiceUrl:
    process.env.ML_SERVICE_URL ?? "http://localhost:8000",

  isProduction: process.env.NODE_ENV === "production",
};