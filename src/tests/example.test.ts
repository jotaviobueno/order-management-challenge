import { describe, it, expect } from "vitest";

describe("Example Test", () => {
  it("should pass a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should verify environment", () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
