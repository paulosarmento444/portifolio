import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^lucide-react/dist/esm/icons/.*\\.js$":
      "<rootDir>/test/mocks/lucide-react-deep-icon.mock.tsx",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@site/account$": "<rootDir>/packages/account/web/src/index.ts",
    "^@site/auth$": "<rootDir>/packages/auth/web/src/index.ts",
    "^@site/blog$": "<rootDir>/packages/blog/web/src/index.ts",
    "^@site/chatbot$": "<rootDir>/packages/chatbot/web/src/index.ts",
    "^@site/checkout$": "<rootDir>/packages/checkout/web/src/index.ts",
    "^@site/shared$": "<rootDir>/packages/shared/web/src/index.ts",
    "^@site/shared/server$": "<rootDir>/packages/shared/web/src/server.ts",
    "^@site/store$": "<rootDir>/packages/store/web/src/index.ts",
    "^@site/integrations/payments$":
      "<rootDir>/packages/integrations/payments/src/index.ts",
    "^@site/integrations/payments/server$":
      "<rootDir>/packages/integrations/payments/src/server.ts",
    "^@site/integrations/cocart$":
      "<rootDir>/packages/integrations/cocart/src/index.ts",
    "^@site/integrations/cocart/server$":
      "<rootDir>/packages/integrations/cocart/src/server.ts",
    "^@site/integrations/wordpress$":
      "<rootDir>/packages/integrations/wordpress/src/index.ts",
    "^@site/integrations/wordpress/register$":
      "<rootDir>/packages/integrations/wordpress/src/register.ts",
    "^@site/integrations/wordpress/server$":
      "<rootDir>/packages/integrations/wordpress/src/server.ts",
  },
};

export default createJestConfig(config);
