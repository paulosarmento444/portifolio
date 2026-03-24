import { render, screen } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";

jest.mock("./components/categories-showcase", () => ({
  __esModule: true,
  default: () => <div data-testid="home-showcase">SHOWCASE</div>,
}));

const Home = require("./page").default as typeof import("./page").default;

describe("home route shell", () => {
  it("renders the storefront home showcase inside the route shell", async () => {
    render(await Home());

    expect(screen.getByTestId("home-showcase").textContent).toBe("SHOWCASE");
  });
});
