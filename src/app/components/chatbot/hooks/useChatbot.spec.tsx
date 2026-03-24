import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest, beforeEach, afterAll } from "@jest/globals";
import { defaultChatbotConfig } from "../config";

const mockSendMessage: any = jest.fn();
const mockReset: any = jest.fn();

jest.mock("@/app/services/chatbot.service", () => ({
  ChatbotService: jest.fn().mockImplementation(() => ({
    sendMessage: mockSendMessage,
    reset: mockReset,
  })),
  normalizeChatbotError: (error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "abort";
    }

    return "O chatbot nao conseguiu responder agora.";
  },
}));

const { useChatbot } = require("./useChatbot") as typeof import("./useChatbot");
const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function HookHarness() {
  const {
    messages,
    isLoading,
    isGenerating,
    error,
    sendMessage,
    stopGeneration,
  } = useChatbot(defaultChatbotConfig);

  return (
    <div>
      <button onClick={() => void sendMessage("Quero um tenis de corrida")}>send</button>
      <button onClick={() => void sendMessage("Tem algo mais tecnico?")}>send-second</button>
      <button onClick={stopGeneration}>stop</button>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="generating">{String(isGenerating)}</div>
      <div data-testid="error">{error ?? ""}</div>
      <ul>
        {messages.map((message, index) => (
          <li key={`${message.role}-${index}`}>{`${message.role}:${message.content}`}</li>
        ))}
      </ul>
    </div>
  );
}

describe("useChatbot", () => {
  beforeEach(() => {
    mockSendMessage.mockReset();
    mockReset.mockReset();
  });

  it("inicializa a conversa e preserva historico multi-turn", async () => {
    mockSendMessage
      .mockResolvedValueOnce("Posso te mostrar duas opcoes leves.")
      .mockResolvedValueOnce("Tambem temos um modelo com mais amortecimento.");

    render(<HookHarness />);

    expect(
      screen.getByText(`bot:${defaultChatbotConfig.firstBotMessage}`),
    ).not.toBeNull();

    fireEvent.click(screen.getByText("send"));

    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(
      screen.getByText("user:Quero um tenis de corrida"),
    ).not.toBeNull();

    await waitFor(() => {
      expect(
        screen.getByText("bot:Posso te mostrar duas opcoes leves."),
      ).not.toBeNull();
    });

    fireEvent.click(screen.getByText("send-second"));

    await waitFor(() => {
      expect(
        screen.getByText(
          "bot:Tambem temos um modelo com mais amortecimento.",
        ),
      ).not.toBeNull();
    });

    expect(mockSendMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        message: "Quero um tenis de corrida",
        history: [{ role: "bot", content: defaultChatbotConfig.firstBotMessage, timestamp: expect.any(Date) }],
      }),
    );

    expect(mockSendMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        message: "Tem algo mais tecnico?",
        history: [
          { role: "bot", content: defaultChatbotConfig.firstBotMessage, timestamp: expect.any(Date) },
          { role: "user", content: "Quero um tenis de corrida", timestamp: expect.any(Date) },
          { role: "bot", content: "Posso te mostrar duas opcoes leves.", timestamp: expect.any(Date) },
        ],
      }),
    );
  });

  it("mostra erro amigavel apenas para falhas nao recuperadas pelo service", async () => {
    mockSendMessage.mockRejectedValueOnce(new Error("unexpected failure"));

    render(<HookHarness />);
    fireEvent.click(screen.getByText("send"));

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toContain("O chatbot nao conseguiu responder agora.");
    });
  });

  it("permite abortar uma resposta em andamento", async () => {
    const deferred = createDeferred<string>();
    let capturedSignal: AbortSignal | undefined;

    mockSendMessage.mockImplementationOnce(async ({ signal }: any) => {
      capturedSignal = signal;
      return deferred.promise;
    });

    render(<HookHarness />);
    fireEvent.click(screen.getByText("send"));

    await waitFor(() => {
      expect(screen.getByTestId("generating").textContent).toBe("true");
    });

    fireEvent.click(screen.getByText("stop"));

    expect(capturedSignal?.aborted).toBe(true);

    await act(async () => {
      deferred.reject(new DOMException("Aborted", "AbortError"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("generating").textContent).toBe("false");
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
  });
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});
