import { afterAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

const originalFetch = global.fetch;
let fetchMock: jest.Mock;

describe("wordpressOrderTrackingServer", () => {
  beforeEach(() => {
    process.env.WORDPRESS_URL = "http://wordpress";
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("requests the headless tracking bridge with the order key header", async () => {
    const { wordpressOrderTrackingServer } = await import(
      "./headless-order-tracking.server"
    );

    (fetchMock as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracking: {
          provider: "Correios",
          code: "AN666661093BR",
          state: "available",
          currentStatus: "Objeto em transferência - por favor aguarde",
          latestEvent: "Objeto em transferência - por favor aguarde",
          latestLocation: "BELO HORIZONTE / MG -> RIO DE JANEIRO / RJ",
          lastUpdatedAt: "2026-03-23T09:25:44",
          history: [
            {
              status: "Objeto em transferência - por favor aguarde",
              occurredAt: "2026-03-23T09:25:44",
            },
          ],
        },
      }),
    });

    const tracking = await wordpressOrderTrackingServer.getOrderTracking({
      orderId: 378,
      orderKey: "wc_order_test",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://wordpress/wp-json/pharmacore/v1/orders/378/tracking",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: expect.objectContaining({
          Accept: "application/json",
          "x-pharmacore-order-key": "wc_order_test",
        }),
      }),
    );
    expect(tracking).toMatchObject({
      code: "AN666661093BR",
      state: "available",
    });
  });

  it("surfaces the bridge error message when the request fails", async () => {
    const { wordpressOrderTrackingServer } = await import(
      "./headless-order-tracking.server"
    );

    (fetchMock as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Objeto não elegível para rastreamento oficial.",
      }),
    });

    await expect(
      wordpressOrderTrackingServer.getOrderTracking({
        orderId: 378,
        orderKey: "wc_order_test",
      }),
    ).rejects.toThrow("Objeto não elegível para rastreamento oficial.");
  });
});
