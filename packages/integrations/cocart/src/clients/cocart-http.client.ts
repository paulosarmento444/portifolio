import type { CoCartEndpointMap } from "../runtime/cocart.constants";

export type CoCartFetch = typeof fetch;

export type CreateCoCartHttpClientConfig = {
  baseUrl: string;
  endpoints: CoCartEndpointMap;
  fetchFn?: CoCartFetch;
  timeoutMs?: number;
};

export type CoCartRequestHeaders = Record<string, string>;

const toQueryString = (query?: Record<string, string | number | boolean | undefined>) => {
  if (!query) {
    return "";
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    search.set(key, String(value));
  }

  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
};

const readJson = async (response: Response) => {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

const withTimeout = async (
  fetchFn: CoCartFetch,
  input: string,
  init: RequestInit,
  timeoutMs?: number,
) => {
  if (!timeoutMs) {
    return fetchFn(input, init);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchFn(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

export const createCoCartHttpClient = (config: CreateCoCartHttpClientConfig) => {
  const fetchFn = config.fetchFn ?? fetch;

  const request = async <TResponse>(
    path: string,
    init: RequestInit = {},
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<TResponse> => {
    const { headers: requestHeaders, ...requestInit } = init;
    const response = await withTimeout(
      fetchFn,
      `${config.baseUrl}${path}${toQueryString(query)}`,
      {
        ...requestInit,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(requestHeaders ?? {}),
        },
      },
      config.timeoutMs,
    );

    const payload = await readJson(response);

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message?: unknown }).message ?? "")
          : `CoCart request failed with status ${response.status}`;

      const error = new Error(
        message || `CoCart request failed with status ${response.status}`,
      ) as Error & {
        response?: {
          status: number;
          data: unknown;
        };
      };

      error.response = {
        status: response.status,
        data: payload,
      };

      throw error;
    }

    return payload as TResponse;
  };

  return {
    endpoints: config.endpoints,
    get: <TResponse>(
      path: string,
      query?: Record<string, string | number | boolean | undefined>,
      headers?: CoCartRequestHeaders,
    ) =>
      request<TResponse>(
        path,
        {
          method: "GET",
          headers,
        },
        query,
      ),
    post: <TResponse>(
      path: string,
      body?: unknown,
      headers?: CoCartRequestHeaders,
    ) =>
      request<TResponse>(path, {
        method: "POST",
        body: body === undefined ? undefined : JSON.stringify(body),
        headers,
      }),
    put: <TResponse>(
      path: string,
      body?: unknown,
      headers?: CoCartRequestHeaders,
    ) =>
      request<TResponse>(path, {
        method: "PUT",
        body: body === undefined ? undefined : JSON.stringify(body),
        headers,
      }),
    delete: <TResponse>(path: string, headers?: CoCartRequestHeaders) =>
      request<TResponse>(path, { method: "DELETE", headers }),
  };
};
