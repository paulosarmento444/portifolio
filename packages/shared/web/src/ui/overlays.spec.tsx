import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "@jest/globals";
import { ModalShell } from "./overlays";

describe("ModalShell", () => {
  it("uses a viewport-safe wrapper and a scrollable panel for small screens", () => {
    render(
      <ModalShell isOpen title="Modal test" description="Descricao de teste.">
        <div>Conteudo</div>
      </ModalShell>,
    );

    const dialog = screen.getByRole("dialog");
    const viewportWrapper = dialog.parentElement;

    expect(viewportWrapper?.className || "").toContain("items-start");
    expect(viewportWrapper?.className || "").toContain("overflow-y-auto");
    expect(dialog.className).toContain("max-h-[calc(100dvh-2rem)]");
    expect(dialog.className).toContain("self-start");
  });

  it("locks document scroll while open and restores it on unmount", () => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const { unmount } = render(
      <ModalShell isOpen title="Modal test">
        <div>Conteudo</div>
      </ModalShell>,
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe(originalBodyOverflow);
    expect(document.documentElement.style.overflow).toBe(originalHtmlOverflow);
  });
});
