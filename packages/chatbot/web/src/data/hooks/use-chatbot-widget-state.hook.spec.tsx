import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { defaultChatbotConfig } from "../chatbot.config";

const sendMessage = jest.fn();
const clearError = jest.fn();
const stopGeneration = jest.fn();

jest.mock("./use-chatbot.hook", () => ({
  useChatbot: jest.fn(() => ({
    messages: [],
    isLoading: false,
    isGenerating: false,
    error: "falha temporaria",
    clearError,
    sendMessage,
    stopGeneration,
  })),
}));

const { useChatbotWidgetState } = require("./use-chatbot-widget-state.hook") as typeof import("./use-chatbot-widget-state.hook");

function HookHarness() {
  const {
    draft,
    isOpen,
    showWelcomeBubble,
    canSend,
    handleOpenChat,
    handleDraftChange,
    handleSendDraft,
  } = useChatbotWidgetState({ config: defaultChatbotConfig });

  return (
    <div>
      <div data-testid="draft">{draft}</div>
      <div data-testid="open">{String(isOpen)}</div>
      <div data-testid="welcome">{String(showWelcomeBubble)}</div>
      <div data-testid="can-send">{String(canSend)}</div>
      <button type="button" onClick={handleOpenChat}>abrir</button>
      <button type="button" onClick={() => handleDraftChange("  tenis  ")}>digitar</button>
      <button type="button" onClick={() => void handleSendDraft()}>enviar</button>
    </div>
  );
}

describe("useChatbotWidgetState", () => {
  beforeEach(() => {
    sendMessage.mockReset();
    clearError.mockReset();
    stopGeneration.mockReset();
    sendMessage.mockImplementation(async () => undefined);
  });

  it("controla abertura, rascunho e envio sem manter essa logica no componente", async () => {
    render(<HookHarness />);

    expect(screen.getByTestId("open").textContent).toBe("false");
    expect(screen.getByTestId("welcome").textContent).toBe("true");
    expect(screen.getByTestId("can-send").textContent).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "abrir" }));
    expect(screen.getByTestId("open").textContent).toBe("true");
    expect(screen.getByTestId("welcome").textContent).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "digitar" }));

    expect(screen.getByTestId("draft").textContent).toBe("  tenis  ");
    expect(screen.getByTestId("can-send").textContent).toBe("true");
    expect(clearError).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "enviar" }));

    await waitFor(() => {
      expect(sendMessage).toHaveBeenCalledWith("tenis");
    });

    expect(screen.getByTestId("draft").textContent).toBe("");
  });
});
