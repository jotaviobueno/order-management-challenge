import { Request, Response, NextFunction } from "express";
import { AlsService } from "../utils/async-context";
import { Logger } from "../utils/logger";
import {
  ACCESS_TOKEN_CONSTANT,
  USER_AGENT_CONSTANT,
  ENDPOINT_CONSTANT,
  IP_ADDRESS_CONSTANT,
  X_TRACING_ID_CONSTANT,
  START_TIME_CONSTANT,
  REQUEST_ID_CONSTANT,
} from "../config/als.constants";
import { randomUUID } from "crypto";

export class MetadataMiddleware {
  private static logger = new Logger("MetadataMiddleware");

  static execute(req: Request, res: Response, next: NextFunction): void {
    const url = req.originalUrl || req.url;

    MetadataMiddleware.logger.log(`Iniciando endpoint: ${url}`);

    const xTracingId = req.headers["x-tracing-id"] as string;
    const xRealIp = req.headers["x-real-ip"] as string;
    const xForwardedFor = req.headers["x-forwarded-for"] as string;
    const userAgent = req.headers["user-agent"] as string;
    const authorization = req.headers["authorization"] as string;
    const token = authorization?.split(" ")?.[1];

    const requestId =
      (req.headers["x-request-id"] as string | undefined) || randomUUID();
    const startTime = Date.now();

    res.setHeader("X-Request-Id", requestId);

    const ipAddress =
      xRealIp ||
      xForwardedFor?.split(",")[0] ||
      req.ip ||
      req.socket.remoteAddress;

    const metadata = {
      [ENDPOINT_CONSTANT]: url,
      [REQUEST_ID_CONSTANT]: requestId,
      [USER_AGENT_CONSTANT]: userAgent,
      [START_TIME_CONSTANT]: startTime,
      [IP_ADDRESS_CONSTANT]: ipAddress,
      [X_TRACING_ID_CONSTANT]: xTracingId,
      [ACCESS_TOKEN_CONSTANT]: token,
    };

    const cleanMetadata = Object.fromEntries(
      Object.entries(metadata).filter(([_, value]) => value !== undefined)
    );

    AlsService.merge(cleanMetadata);

    MetadataMiddleware.logger.debug(
      `Metadata setado: ${JSON.stringify(cleanMetadata)}`
    );

    next();
  }
}
