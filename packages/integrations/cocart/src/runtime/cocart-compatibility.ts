const COCART_FALLBACK_STATUS_CODES = new Set([404, 405, 501]);
const COCART_FALLBACK_MESSAGE_PATTERNS = [
  /rest_no_route/i,
  /not found/i,
  /unsupported/i,
  /not supported/i,
] as const;

type CoCartErrorLike = Error & {
  response?: {
    status?: number;
    data?: unknown;
  };
};

export const isCoCartCompatibilityFallbackError = (
  error: unknown,
): error is CoCartErrorLike => {
  if (!(error instanceof Error)) {
    return false;
  }

  const response = (error as CoCartErrorLike).response;
  const status = response?.status;

  if (status && COCART_FALLBACK_STATUS_CODES.has(status)) {
    return true;
  }

  const rawMessage =
    typeof response?.data === "object" &&
    response?.data &&
    "message" in response.data
      ? String((response.data as { message?: unknown }).message ?? "")
      : error.message;

  return COCART_FALLBACK_MESSAGE_PATTERNS.some((pattern) =>
    pattern.test(rawMessage),
  );
};
