import { describe, expect, it } from "@jest/globals";
import { wooRestClientInternals } from "./woocommerce.client";

describe("woocommerce client request URL resolution", () => {
  it("keeps the Woo REST base path when axios receives a leading-slash endpoint", () => {
    const resolved = wooRestClientInternals.resolveAxiosRequestUrl({
      baseURL: "http://wordpress:80/wp-json/wc/v3",
      url: "/orders",
    });

    expect(resolved.toString()).toBe("http://wordpress/wp-json/wc/v3/orders");
  });

  it("preserves absolute request URLs untouched", () => {
    const resolved = wooRestClientInternals.resolveAxiosRequestUrl({
      baseURL: "http://wordpress:80/wp-json/wc/v3",
      url: "http://example.com/custom/orders",
    });

    expect(resolved.toString()).toBe("http://example.com/custom/orders");
  });
});
