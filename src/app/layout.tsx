import type React from "react";
import type { Metadata } from "next";
import { DEFAULT_THEME, buildThemeInitScript } from "@site/shared";
import { BackToTop } from "./components/back-to-top";
import { ChatbotWidget } from "./components/chatbot/ChatbotWidget";
import { defaultChatbotConfig } from "./components/chatbot/config";
import { AppShell } from "./components/AppShell";
import Script from "next/script";
import { publicEnv } from "./lib/env.public";
import "./globals.css";

const siteUrl = publicEnv.appUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Solar Esportes - Loja e Blog",
    template: "%s | Solar Esportes",
  },
  description:
    "Loja de artigos esportivos com produtos premium, blog especializado e experiência de compra otimizada para performance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Solar Esportes",
    title: "Solar Esportes - Loja e Blog",
    description:
      "Conheça a Solar Esportes: equipamentos esportivos, conteúdo especializado e uma jornada de compra fluida.",
  },
  other: {
    "google-adsense-account": "ca-pub-2694217258702912",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      data-theme={DEFAULT_THEME}
      className="theme-light"
      suppressHydrationWarning
    >
      <head>
        <script
          id="site-theme-init"
          dangerouslySetInnerHTML={{ __html: buildThemeInitScript(DEFAULT_THEME) }}
        />
      </head>
      <body className="site-shell-background text-[color:var(--site-color-foreground)] scrollbar-hide">
        {/* Script do AdSense - Adicionar após aprovação */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2694217258702912"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <BackToTop />

        {/* Chatbot Widget */}
        <ChatbotWidget config={defaultChatbotConfig} />

        {/* <Script
          id="tawk-chat"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/686122730fa35a190e03dfde/1iutmt4qe';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);`
            })();
          `,
          }}
        /> */}

        <AppShell initialTheme={DEFAULT_THEME}>{children}</AppShell>
      </body>
    </html>
  );
}
