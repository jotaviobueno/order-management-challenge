export type LogLevel = "log" | "error" | "warn" | "debug" | "verbose";

export interface LoggerOptions {
  timestamp?: boolean;
  includeContext?: boolean;
}
