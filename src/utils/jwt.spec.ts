import { describe, it, expect, vi, beforeEach } from "vitest";
import { JwtService } from "./jwt";
import jwt from "jsonwebtoken";

vi.mock("../config/env", () => ({
  config: {
    jwt: {
      secret: "test-secret-key",
      expiresIn: "1h",
    },
  },
}));

describe("JwtService", () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  describe("generate", () => {
    it("deve gerar token JWT válido", () => {
      const payload = {
        sub: "user-123",
        email: "test@test.com",
      };

      const token = jwtService.generate(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("deve incluir payload no token", () => {
      const payload = {
        sub: "user-456",
        email: "user@test.com",
      };

      const token = jwtService.generate(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
    });

    it("deve incluir expiration no token", () => {
      const payload = {
        sub: "user-789",
        email: "test@test.com",
      };

      const token = jwtService.generate(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it("deve gerar tokens diferentes para mesmo payload", () => {
      const payload = {
        sub: "user-123",
        email: "test@test.com",
      };

      const token1 = jwtService.generate(payload);
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);
      const token2 = jwtService.generate(payload);
      vi.useRealTimers();

      expect(token1).not.toBe(token2);
    });
  });

  describe("verify", () => {
    it("deve verificar e decodificar token válido", () => {
      const payload = {
        sub: "user-123",
        email: "test@test.com",
      };

      const token = jwtService.generate(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
    });

    it("deve lançar erro para token inválido", () => {
      const invalidToken = "invalid.token.here";

      expect(() => jwtService.verify(invalidToken)).toThrow();
    });

    it("deve lançar erro para token malformado", () => {
      const malformedToken = "not-a-jwt-token";

      expect(() => jwtService.verify(malformedToken)).toThrow();
    });

    it("deve lançar erro para token com assinatura inválida", () => {
      const payload = {
        sub: "user-123",
        email: "test@test.com",
      };

      const token = jwt.sign(payload, "wrong-secret", { expiresIn: "1h" });

      expect(() => jwtService.verify(token)).toThrow();
    });

    it("deve lançar erro para token vazio", () => {
      expect(() => jwtService.verify("")).toThrow();
    });

    it("deve preservar tipos de dados do payload", () => {
      const payload = {
        sub: "user-123",
        email: "test@test.com",
      };

      const token = jwtService.generate(payload);
      const decoded = jwtService.verify(token);

      expect(typeof decoded.sub).toBe("string");
      expect(typeof decoded.email).toBe("string");
    });
  });

  describe("integração generate e verify", () => {
    it("deve funcionar em fluxo completo", () => {
      const testCases = [
        { sub: "user-1", email: "user1@test.com" },
        { sub: "user-2", email: "user2@example.com" },
        { sub: "admin-123", email: "admin@company.com" },
      ];

      testCases.forEach((payload) => {
        const token = jwtService.generate(payload);
        const decoded = jwtService.verify(token);

        expect(decoded.sub).toBe(payload.sub);
        expect(decoded.email).toBe(payload.email);
      });
    });

    it("deve manter integridade dos dados", () => {
      const payload = {
        sub: "user-with-special-chars-!@#$",
        email: "test+tag@example.com",
      };

      const token = jwtService.generate(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.email).toBe(payload.email);
    });
  });
});
