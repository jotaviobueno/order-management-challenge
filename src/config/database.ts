import mongoose from "mongoose";
import { Logger } from "../utils/logger";

const logger = new Logger("Database");

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/order-management";

    await mongoose.connect(mongoUri);

    logger.log("✅ MongoDB conectado com sucesso");
  } catch (error) {
    logger.error(
      "❌ Erro ao conectar ao MongoDB",
      error instanceof Error ? error.stack : undefined
    );
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  logger.warn("⚠️  MongoDB desconectado");
});

mongoose.connection.on("error", (error) => {
  logger.error(
    "❌ Erro no MongoDB",
    error instanceof Error ? error.stack : undefined
  );
});
