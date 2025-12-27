import { AlsService } from "./async-context";
import { REQUEST_ID_CONSTANT } from "../config/als.constants";
import { LogLevel, LoggerOptions } from "../types/logger.types";

export class Logger {
  private context?: string;
  private options: LoggerOptions;

  constructor(context?: string, options?: LoggerOptions) {
    this.context = context;
    this.options = {
      timestamp: true,
      includeContext: true,
      ...options,
    };
  }

  private static colors = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    cyan: "\x1b[36m",
    magenta: "\x1b[35m",
    blue: "\x1b[34m",
  };

  private getTimestamp(): string {
    const now = new Date();
    const date = now.toLocaleDateString("pt-BR");
    const time = now.toLocaleTimeString("pt-BR");
    return `${date} ${time}`;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string
  ): string {
    const { colors } = Logger;
    const timestamp = this.options.timestamp
      ? `${colors.dim}[${this.getTimestamp()}]${colors.reset} `
      : "";

    const requestId = AlsService.get<string>(REQUEST_ID_CONSTANT);

    const requestIdStr = requestId
      ? `${colors.cyan}[${requestId.substring(0, 8)}]${colors.reset} `
      : "";

    const ctx = context || this.context;
    const contextStr = ctx ? `${colors.yellow}[${ctx}]${colors.reset} ` : "";

    let levelColor = colors.reset;
    let levelStr = level.toUpperCase();

    switch (level) {
      case "error":
        levelColor = colors.red;
        break;
      case "warn":
        levelColor = colors.yellow;
        break;
      case "log":
        levelColor = colors.green;
        break;
      case "debug":
        levelColor = colors.magenta;
        break;
      case "verbose":
        levelColor = colors.cyan;
        break;
    }

    const levelFormatted = `${levelColor}${colors.bold}[${levelStr}]${colors.reset}`;

    return `${timestamp}${requestIdStr}${levelFormatted} ${contextStr}${message}`;
  }

  private print(
    level: LogLevel,
    message: any,
    context?: string,
    trace?: string
  ): void {
    const messageStr =
      typeof message === "object"
        ? JSON.stringify(message, null, 2)
        : String(message);
    const formattedMessage = this.formatMessage(level, messageStr, context);

    switch (level) {
      case "error":
        console.error(formattedMessage);
        if (trace) {
          console.error(trace);
        }
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  log(message: any, context?: string): void {
    this.print("log", message, context);
  }

  error(message: any, trace?: string, context?: string): void {
    this.print("error", message, context, trace);
  }

  warn(message: any, context?: string): void {
    this.print("warn", message, context);
  }

  debug(message: any, context?: string): void {
    this.print("debug", message, context);
  }

  verbose(message: any, context?: string): void {
    this.print("verbose", message, context);
  }

  setContext(context: string): void {
    this.context = context;
  }

  static log(message: any, context?: string): void {
    new Logger().log(message, context);
  }

  static error(message: any, trace?: string, context?: string): void {
    new Logger().error(message, trace, context);
  }

  static warn(message: any, context?: string): void {
    new Logger().warn(message, context);
  }

  static debug(message: any, context?: string): void {
    new Logger().debug(message, context);
  }

  static verbose(message: any, context?: string): void {
    new Logger().verbose(message, context);
  }
}
