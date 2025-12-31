import { config } from "./config/env";
import { connectDatabase } from "./config/database";
import { createApp } from "./app";
import { Logger } from "./utils/logger";

const logger = new Logger("Bootstrap");

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const app = createApp();

    app.listen(config.port, () => {
      logger.log(`🚀 Servidor rodando na porta ${config.port}`);
      logger.log(`📝 Ambiente: ${config.nodeEnv}`);
      logger.log(`🔗 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error("❌ Erro ao iniciar servidor", error instanceof Error ? error.stack : undefined);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err: Error) => {
  logger.error("❌ Unhandled Promise Rejection", err.stack);
  process.exit(1);
});

startServer();
