import "server-only";

type EnvReadOptions = {
  legacy?: string[];
  defaultValue?: string;
};

const warnedKeys = new Set<string>();

const readEnv = (key: string, options?: EnvReadOptions): string => {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (options?.legacy) {
    for (const legacyKey of options.legacy) {
      const legacyValue = process.env[legacyKey];

      if (legacyValue) {
        if (!warnedKeys.has(key)) {
          warnedKeys.add(key);
          console.warn(
            `[env] ${legacyKey} is deprecated. Use ${key} instead.`,
          );
        }

        return legacyValue;
      }
    }
  }

  if (options?.defaultValue !== undefined) {
    return options.defaultValue;
  }

  const legacyHint = options?.legacy?.length
    ? ` (legacy: ${options.legacy.join(", ")})`
    : "";

  throw new Error(
    `[env] Missing required environment variable: ${key}${legacyHint}`,
  );
};

const readOptionalEnv = (
  key: string,
  options?: EnvReadOptions,
): string | null => {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (options?.legacy) {
    for (const legacyKey of options.legacy) {
      const legacyValue = process.env[legacyKey];

      if (legacyValue) {
        if (!warnedKeys.has(key)) {
          warnedKeys.add(key);
          console.warn(
            `[env] ${legacyKey} is deprecated. Use ${key} instead.`,
          );
        }

        return legacyValue;
      }
    }
  }

  return null;
};

export const serverEnv = {
  app: {
    get publicUrl() {
      return readEnv("NEXT_PUBLIC_APP_URL", {
        legacy: ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_URL"],
      });
    },
  },
  wordpress: {
    get url() {
      return readEnv("WORDPRESS_URL");
    },
    get publicUrl() {
      return readEnv("NEXT_PUBLIC_WORDPRESS_PUBLIC_URL", {
        legacy: ["NEXT_PUBLIC_WORDPRESS_URL"],
        defaultValue: readEnv("WORDPRESS_URL"),
      });
    },
    get graphqlUrl() {
      return readEnv("NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL", {
        legacy: ["NEXT_PUBLIC_API_URL"],
      });
    },
    get wooConsumerKey() {
      return readEnv("WOOCOMMERCE_CONSUMER_KEY", {
        legacy: ["NEXT_PUBLIC_WC_CONSUMER_KEY"],
      });
    },
    get wooConsumerSecret() {
      return readEnv("WOOCOMMERCE_CONSUMER_SECRET", {
        legacy: ["NEXT_PUBLIC_WC_CONSUMER_SECRET"],
      });
    },
  },
  faust: {
    get secretKey() {
      return readEnv("FAUST_SECRET_KEY");
    },
  },
  hooks: {
    get webhookUrl() {
      return readEnv("WEBHOOK_URL");
    },
  },
  payments: {
    mercadoPago: {
      get accessToken() {
        return readOptionalEnv("MERCADO_PAGO_ACCESS_TOKEN");
      },
      get publicKey() {
        return readOptionalEnv("NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY", {
          legacy: ["MERCADO_PAGO_PUBLIC_KEY"],
        });
      },
      get siteId() {
        return readOptionalEnv("MERCADO_PAGO_SITE_ID");
      },
    },
  },
};
