/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    dirs: [
      "packages/shared/web",
      "packages/integrations/wordpress",
      "packages/integrations/payments",
      "packages/store/web",
      "packages/blog/web",
      "packages/chatbot/web",
      "packages/auth/web",
      "packages/account/web",
      "packages/checkout/web",
      "src/app/store",
      "src/app/blog",
      "src/app/auth",
      "src/app/my-account",
      "src/app/my-cart",
      "src/app/order-confirmation",
      "src/app/lib",
      "src/app/api"
    ]
  },
  images: {
    remotePatterns: [
      // Permitir qualquer HTTPS
      {
        protocol: "https",
        hostname: "**",
      },
      // Permitir localhost com HTTP (para dev)
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
