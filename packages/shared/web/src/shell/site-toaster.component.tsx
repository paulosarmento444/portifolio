"use client";

import { ecommerceToastOptions } from "../ui";
import { Toaster as ToasterProvider } from "react-hot-toast";

export function SiteToaster() {
  return (
    <ToasterProvider
      position="bottom-center"
      toastOptions={ecommerceToastOptions}
    />
  );
}
