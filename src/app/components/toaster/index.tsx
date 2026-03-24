"use client";

import { ecommerceToastOptions } from "@site/shared";
import { Toaster as ToasterProvider } from "react-hot-toast";

export const Toaster = () => {
  return (
    <ToasterProvider
      position="bottom-center"
      toastOptions={ecommerceToastOptions}
    />
  );
};
