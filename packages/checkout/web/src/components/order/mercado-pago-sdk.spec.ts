import { afterEach, describe, expect, it } from "@jest/globals";

const { buildMercadoPagoFieldStyle } = require("./mercado-pago-sdk") as typeof import("./mercado-pago-sdk");

describe("buildMercadoPagoFieldStyle", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--site-color-foreground-strong");
    document.documentElement.style.removeProperty("--site-color-foreground-soft");
  });

  it("reads the active theme colors from CSS variables", () => {
    document.documentElement.style.setProperty("--site-color-foreground-strong", "#f8fafc");
    document.documentElement.style.setProperty("--site-color-foreground-soft", "#94a3b8");

    const style = buildMercadoPagoFieldStyle();

    expect(style.color).toBe("#f8fafc");
    expect(style.placeholderColor).toBe("#94a3b8");
  });

  it("keeps the secure fields compact without changing the SDK contract", () => {
    const style = buildMercadoPagoFieldStyle();

    expect(style.fontSize).toBe("15px");
    expect(style.height).toBe("44px");
    expect(style.padding).toBe("10px 12px");
    expect(style.textAlign).toBe("left");
  });
});
