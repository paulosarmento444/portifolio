import { jest } from "@jest/globals";
import "@testing-library/jest-dom";

jest.mock("server-only", () => ({}));

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});
