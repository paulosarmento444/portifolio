import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { BackToTopButton } from "./back-to-top-button.component";

jest.mock("framer-motion", () => {
  const React = require("react");

  const createPrimitive = () => {
    const Primitive = React.forwardRef(({ children, ...props }: any, ref: React.ForwardedRef<any>) =>
      React.createElement("div", { ref, ...props }, children),
    );
    Primitive.displayName = "MotionDivMock";
    return Primitive;
  };

  return {
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
      div: createPrimitive(),
    },
  };
});

describe("BackToTopButton", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 0,
    });
    (window.scrollTo as jest.Mock).mockClear();
  });

  it("appears after the user scrolls down and scrolls smoothly to the top", () => {
    render(<BackToTopButton />);

    expect(screen.queryByRole("button", { name: "Voltar ao topo" })).toBeNull();

    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 640,
    });

    fireEvent.scroll(window);

    fireEvent.click(screen.getByRole("button", { name: "Voltar ao topo" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
