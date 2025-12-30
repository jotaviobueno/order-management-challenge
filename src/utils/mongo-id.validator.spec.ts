import { describe, it, expect } from "vitest";
import { MongoIdValidator } from "./mongo-id.validator";

describe("MongoIdValidator", () => {
  describe("isValid", () => {
    it("deve retornar true para MongoDB ID válido", () => {
      const validIds = [
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd7994390aa",
        "507f1f77bcf86cd7994390ff",
        "000000000000000000000000",
        "ffffffffffffffffffffffff",
      ];

      validIds.forEach((id) => {
        expect(MongoIdValidator.isValid(id)).toBe(true);
      });
    });

    it("deve retornar false para MongoDB ID inválido", () => {
      const invalidIds = [
        "507f1f77bcf86cd79943901",
        "507f1f77bcf86cd7994390111",
        "507f1f77bcf86cd79943901g",
        "507f1f77bcf86cd79943901x",
        "507f1f77bcf86cd79943901!",
        "507f1f77bcf86cd79943901 ",
        "",
        " ",
        "not-a-mongo-id",
        "123",
        "507f1f77bcf86cd799439011\n",
      ];

      invalidIds.forEach((id) => {
        expect(MongoIdValidator.isValid(id)).toBe(false);
      });
    });

    it("deve ser case insensitive para hexadecimais", () => {
      const upperCaseId = "507F1F77BCF86CD799439011";
      const lowerCaseId = "507f1f77bcf86cd799439011";
      const mixedCaseId = "507F1f77bCf86Cd799439011";

      expect(MongoIdValidator.isValid(upperCaseId)).toBe(true);
      expect(MongoIdValidator.isValid(lowerCaseId)).toBe(true);
      expect(MongoIdValidator.isValid(mixedCaseId)).toBe(true);
    });

    it("deve validar apenas caracteres hexadecimais", () => {
      const hexChars = "0123456789abcdef";
      const validHexId = hexChars.repeat(3);

      expect(MongoIdValidator.isValid("0123456789abcdef01234567")).toBe(true);
      expect(MongoIdValidator.isValid("0123456789ABCDEF01234567")).toBe(true);
    });

    it("deve rejeitar IDs com caracteres não hexadecimais", () => {
      const nonHexIds = [
        "507f1f77bcf86cd79943901z",
        "507f1f77bcf86cd79943901g",
        "g07f1f77bcf86cd799439011",
        "507f1f77bcf86cd79943901!",
        "507f1f77bcf86cd79943901@",
      ];

      nonHexIds.forEach((id) => {
        expect(MongoIdValidator.isValid(id)).toBe(false);
      });
    });
  });
});
