type PublicEnvReadOptions = {
  legacy?: Array<{ key: string; value: string | undefined }>;
  defaultValue?: string;
};

const warnedPublicKeys = new Set<string>();

const readPublicEnv = (
  key: string,
  value: string | undefined,
  options?: PublicEnvReadOptions,
): string => {
  if (value) {
    return value;
  }

  if (options?.legacy) {
    for (const legacyEntry of options.legacy) {
      const legacyValue = legacyEntry.value;

      if (legacyValue) {
        if (!warnedPublicKeys.has(key)) {
          warnedPublicKeys.add(key);
          console.warn(
            `[env] ${legacyEntry.key} is deprecated. Use ${key} instead.`,
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
    ? ` (legacy: ${options.legacy.map(({ key: legacyKey }) => legacyKey).join(", ")})`
    : "";

  throw new Error(`[env] Missing required public environment variable: ${key}${legacyHint}`);
};

export const publicEnv = {
  get appUrl() {
    return readPublicEnv("NEXT_PUBLIC_APP_URL", process.env.NEXT_PUBLIC_APP_URL, {
      legacy: [
        { key: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL },
        { key: "NEXT_PUBLIC_URL", value: process.env.NEXT_PUBLIC_URL },
      ],
    });
  },
  get wordpressPublicUrl() {
    return readPublicEnv(
      "NEXT_PUBLIC_WORDPRESS_PUBLIC_URL",
      process.env.NEXT_PUBLIC_WORDPRESS_PUBLIC_URL,
      {
        legacy: [
          {
            key: "NEXT_PUBLIC_WORDPRESS_URL",
            value: process.env.NEXT_PUBLIC_WORDPRESS_URL,
          },
        ],
      },
    );
  },
  get wordpressGraphqlUrl() {
    return readPublicEnv(
      "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL",
      process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL,
      {
        legacy: [
          { key: "NEXT_PUBLIC_API_URL", value: process.env.NEXT_PUBLIC_API_URL },
        ],
      },
    );
  },
};
