import express, { Application } from "express";
import cors from "cors";
import { ErrorHandler } from "./exceptions";
import { MetadataMiddleware } from "./middlewares/metadata.middleware";
import { userRouter, authRouter, orderRouter } from "./routes";

export const createApp = (): Application => {
  const app = express();

  app.use(MetadataMiddleware.execute);
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/order", orderRouter);

  app.use(ErrorHandler.execute);

  return app;
};
