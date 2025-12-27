import { describe, it, expect } from "vitest";
import { BcryptService } from "./bcrypt";

describe("BcryptService", () => {
  describe("hash", () => {
    it("deve gerar hash de senha", async () => {
      const password = "mySecurePassword123";

      const hash = await BcryptService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    it("deve gerar hashes diferentes para mesma senha", async () => {
      const password = "samePassword";

      const hash1 = await BcryptService.hash(password);
      const hash2 = await BcryptService.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it("deve gerar hash para senha vazia", async () => {
      const password = "";

      const hash = await BcryptService.hash(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it("deve gerar hash para senha com caracteres especiais", async () => {
      const password = "P@ssw0rd!#$%^&*()";

      const hash = await BcryptService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);
    });
  });

  describe("compare", () => {
    it("deve retornar true para senha correta", async () => {
      const password = "correctPassword";
      const hash = await BcryptService.hash(password);

      const result = await BcryptService.compare(password, hash);

      expect(result).toBe(true);
    });

    it("deve retornar false para senha incorreta", async () => {
      const password = "correctPassword";
      const wrongPassword = "wrongPassword";
      const hash = await BcryptService.hash(password);

      const result = await BcryptService.compare(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it("deve retornar false para senha vazia quando hash não é vazio", async () => {
      const password = "somePassword";
      const hash = await BcryptService.hash(password);

      const result = await BcryptService.compare("", hash);

      expect(result).toBe(false);
    });

    it("deve ser case sensitive", async () => {
      const password = "MyPassword";
      const hash = await BcryptService.hash(password);

      const resultLower = await BcryptService.compare("mypassword", hash);
      const resultUpper = await BcryptService.compare("MYPASSWORD", hash);
      const resultCorrect = await BcryptService.compare("MyPassword", hash);

      expect(resultLower).toBe(false);
      expect(resultUpper).toBe(false);
      expect(resultCorrect).toBe(true);
    });

    it("deve validar senhas com caracteres especiais", async () => {
      const password = "P@ss!#$123";
      const hash = await BcryptService.hash(password);

      const result = await BcryptService.compare(password, hash);

      expect(result).toBe(true);
    });

    it("deve validar senhas longas", async () => {
      const password = "a".repeat(100);
      const hash = await BcryptService.hash(password);

      const result = await BcryptService.compare(password, hash);

      expect(result).toBe(true);
    });
  });

  describe("integração hash e compare", () => {
    it("deve funcionar corretamente em fluxo completo", async () => {
      const passwords = [
        "simple123",
        "P@ssw0rd!",
        "very_long_password_with_many_characters_123456789",
        "UTF-8: 日本語パスワード",
      ];

      for (const password of passwords) {
        const hash = await BcryptService.hash(password);
        const isValid = await BcryptService.compare(password, hash);
        const isInvalid = await BcryptService.compare("wrong", hash);

        expect(isValid).toBe(true);
        expect(isInvalid).toBe(false);
      }
    });
  });
});
