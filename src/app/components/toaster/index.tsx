"use client";

import { Toaster as ToasterProvider } from "react-hot-toast";

export const Toaster = () => {
  return (
    <ToasterProvider
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        success: {
          style: {
            background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
            color: "#fff",
            border: "1px solid rgba(6, 182, 212, 0.3)",
            borderRadius: "16px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            backdropFilter: "blur(10px)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 182, 212, 0.1)",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#06b6d4",
          },
        },
        error: {
          style: {
            background: "linear-gradient(135deg, #ef4444, #f97316)",
            color: "#fff",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "16px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            backdropFilter: "blur(10px)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(239, 68, 68, 0.1)",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#ef4444",
          },
        },
        loading: {
          style: {
            background: "linear-gradient(135deg, #6b7280, #374151)",
            color: "#fff",
            border: "1px solid rgba(107, 114, 128, 0.3)",
            borderRadius: "16px",
            padding: "16px 24px",
            fontSize: "16px",
            fontWeight: "600",
            backdropFilter: "blur(10px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        },
      }}
    />
  );
};
