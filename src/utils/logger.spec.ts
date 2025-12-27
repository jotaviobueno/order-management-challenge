import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { Logger } from "./logger";
import { AlsService } from "./async-context";

vi.mock("./async-context");

describe("Logger", () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe("log", () => {
    it("deve fazer log de mensagem simples", () => {
      Logger.log("Test message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("Test message");
      expect(output).toContain("[LOG]");
    });

    it("deve incluir context quando fornecido", () => {
      Logger.log("Test message", "TestContext");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("TestContext");
    });

    it("deve usar context de instância quando não fornecido", () => {
      const logger = new Logger("InstanceContext");
      logger.log("Test message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("InstanceContext");
    });
  });

  describe("error", () => {
    it("deve fazer log de erro", () => {
      Logger.error("Error message");

      expect(consoleErrorSpy).toHaveBeenCalled();
      const output = consoleErrorSpy.mock.calls[0][0];
      expect(output).toContain("Error message");
      expect(output).toContain("[ERROR]");
    });

    it("deve fazer log de Error object", () => {
      const error = new Error("Something went wrong");
      Logger.error(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("deve aceitar context para Error object", () => {
      const error = new Error("Test error");

      expect(() => Logger.error(error, "ErrorContext")).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("warn", () => {
    it("deve fazer log de warning", () => {
      Logger.warn("Warning message");

      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).toContain("Warning message");
      expect(output).toContain("[WARN]");
    });

    it("deve incluir context em warning", () => {
      Logger.warn("Warning message", "WarnContext");

      expect(consoleWarnSpy).toHaveBeenCalled();
      const output = consoleWarnSpy.mock.calls[0][0];
      expect(output).toContain("WarnContext");
    });
  });

  describe("debug", () => {
    it("deve aceitar mensagem de debug", () => {
      expect(() => Logger.debug("Debug message")).not.toThrow();
    });
  });

  describe("verbose", () => {
    it("deve fazer log de verbose", () => {
      Logger.verbose("Verbose message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("Verbose message");
      expect(output).toContain("[VERBOSE]");
    });
  });

  describe("requestId integration", () => {
    it("deve incluir requestId quando disponível no ALS", () => {
      vi.spyOn(AlsService, "get").mockReturnValue("req-123-456");

      Logger.log("Test with requestId");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("req-123");
    });

    it("deve funcionar sem requestId no ALS", () => {
      vi.spyOn(AlsService, "get").mockReturnValue(undefined);

      Logger.log("Test without requestId");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("Test without requestId");
    });
  });

  describe("instance logger", () => {
    it("deve criar logger com context", () => {
      const logger = new Logger("ServiceName");
      logger.log("Instance message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("ServiceName");
      expect(output).toContain("Instance message");
    });

    it("deve permitir override de context em instância", () => {
      const logger = new Logger("DefaultContext");
      logger.log("Message", "OverrideContext");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("OverrideContext");
    });

    it("deve manter context de instância entre chamadas", () => {
      const logger = new Logger("PersistentContext");

      logger.log("Message 1");
      logger.warn("Message 2");
      logger.error("Message 3");

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const logOutput = consoleLogSpy.mock.calls[0][0];
      const warnOutput = consoleWarnSpy.mock.calls[0][0];
      const errorOutput = consoleErrorSpy.mock.calls[0][0];

      expect(logOutput).toContain("PersistentContext");
      expect(warnOutput).toContain("PersistentContext");
      expect(errorOutput).toContain("PersistentContext");
    });
  });

  describe("timestamp", () => {
    it("deve incluir timestamp em todas as mensagens", () => {
      Logger.log("Test message");

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toMatch(/\[\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\]/);
    });
  });

  describe("diferentes tipos de input", () => {
    it("deve fazer log de números", () => {
      Logger.log(12345);

      expect(consoleLogSpy).toHaveBeenCalled();
      const output = consoleLogSpy.mock.calls[0][0];
      expect(output).toContain("12345");
    });

    it("deve fazer log de objetos", () => {
      const obj = { key: "value", nested: { data: 123 } };
      Logger.log(obj);

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("deve fazer log de arrays", () => {
      const arr = [1, 2, 3, "test"];
      Logger.log(arr);

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("deve fazer log de valores undefined e null", () => {
      Logger.log(undefined);
      Logger.log(null);

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });
});
