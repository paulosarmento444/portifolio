import { describe, expect, it } from "@jest/globals";
import { isCoCartCompatibilityFallbackError } from "./cocart-compatibility";

describe("cocart-compatibility", () => {
  it("treats missing or unsupported CoCart routes as compatibility fallbacks", () => {
    const notFoundError = Object.assign(new Error("rest_no_route"), {
      response: { status: 404 },
    });
    const unsupportedError = Object.assign(new Error("not supported"), {
      response: { status: 501 },
    });

    expect(isCoCartCompatibilityFallbackError(notFoundError)).toBe(true);
    expect(isCoCartCompatibilityFallbackError(unsupportedError)).toBe(true);
  });

  it("does not treat authentication/authorization failures as compatibility fallbacks", () => {
    const unauthorizedError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
    });
    const forbiddenError = Object.assign(new Error("Forbidden"), {
      response: { status: 403 },
    });

    expect(isCoCartCompatibilityFallbackError(unauthorizedError)).toBe(false);
    expect(isCoCartCompatibilityFallbackError(forbiddenError)).toBe(false);
  });
});
