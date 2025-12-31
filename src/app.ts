import express, { Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { userRouter, authRouter, orderRouter } from "./routes";
import { metadataMiddleware, errorHandler } from "./container";
import { swaggerSpec } from "./config/swagger";

export const createApp = (): Application => {
  const app = express();

  app.use(metadataMiddleware.execute);

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Order Management API - Documentation",
    })
  );

  app.get("/api-docs.json", (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.get("/health", (_, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/order", orderRouter);

  app.use(errorHandler.execute);

  return app;
};
