import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1); // Required for CORS to work with Express
  app.use(helmet());
  app.use(cors({
    origin: env.frontendUrl,
    credentials: true, // Required so the browser sends the httpOnly refresh-token cookie cross-origin
  }));
  app.use(express.json());
  app.use(cookieParser()); // Parses cookies into req.cookies — needed for refresh token
  app.use("/uploads", express.static("uploads"));
  app.use(morgan(env.isProduction ? "combined" : "dev"));

  app.use("/api/v1", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
