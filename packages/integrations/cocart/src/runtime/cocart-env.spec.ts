import { afterEach, describe, expect, it, jest } from "@jest/globals";
import {
  readCoCartServerRuntimeConfig,
  resolveCoCartServerBaseUrl,
} from "./cocart-env";

const originalEnv = process.env;

describe("CoCart server runtime env", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("derives the server CoCart base URL from WORDPRESS_URL inside Docker", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    process.env = {
      ...originalEnv,
      WORDPRESS_URL: "http://wordpress:80",
      COCART_API_URL: "http://localhost:8080/wp-json/cocart/v2",
    };

    expect(resolveCoCartServerBaseUrl()).toBe("http://wordpress:80/wp-json/cocart/v2");
    expect(readCoCartServerRuntimeConfig().baseUrl).toBe(
      "http://wordpress:80/wp-json/cocart/v2",
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "[cocart] Ignoring loopback COCART_API_URL for server-side requests. Using WORDPRESS_URL-derived CoCart base URL instead.",
    );
  });

  it("rewrites a loopback WORDPRESS_URL to the Docker-internal WordPress host for server requests", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    process.env = {
      ...originalEnv,
      WORDPRESS_URL: "http://localhost:8080",
      COCART_API_URL: "http://localhost:8080/wp-json/cocart/v2",
    };

    expect(resolveCoCartServerBaseUrl()).toBe("http://wordpress:80/wp-json/cocart/v2");
    expect(readCoCartServerRuntimeConfig().baseUrl).toBe(
      "http://wordpress:80/wp-json/cocart/v2",
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "[cocart] Ignoring loopback WORDPRESS_URL for server-side requests. Using Docker-internal WordPress base URL instead.",
    );
  });

  it("falls back to COCART_API_URL when WORDPRESS_URL is not available", () => {
    const envWithoutWordpress = { ...originalEnv };
    delete envWithoutWordpress.WORDPRESS_URL;

    process.env = {
      ...envWithoutWordpress,
      COCART_API_URL: "https://store.example.com/wp-json/cocart/v2",
    };

    expect(resolveCoCartServerBaseUrl()).toBe(
      "https://store.example.com/wp-json/cocart/v2",
    );
  });

  it("rewrites a loopback COCART_API_URL to the Docker-internal WordPress host when WORDPRESS_URL is absent", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const envWithoutWordpress = { ...originalEnv };
    delete envWithoutWordpress.WORDPRESS_URL;

    process.env = {
      ...envWithoutWordpress,
      COCART_API_URL: "http://localhost:8080/wp-json/cocart/v2",
    };

    expect(resolveCoCartServerBaseUrl()).toBe("http://wordpress:80/wp-json/cocart/v2");
    expect(warnSpy).toHaveBeenCalledWith(
      "[cocart] Ignoring loopback COCART_API_URL for server-side requests. Using Docker-internal WordPress base URL instead.",
    );
  });
});
