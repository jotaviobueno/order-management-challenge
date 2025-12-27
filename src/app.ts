import express, { Application } from "express";
import cors from "cors";
import { ErrorHandler } from "./exceptions";
import { MetadataMiddleware } from "./middlewares/metadata.middleware";

export const createApp = (): Application => {
  const app = express();

  app.use(MetadataMiddleware.execute);
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use(ErrorHandler.execute);

  return app;
};
