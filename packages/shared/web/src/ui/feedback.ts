import type { DefaultToastOptions } from "react-hot-toast";
import { ecommerceFeedbackStyles } from "../design-system";

const baseToastStyle = {
  borderRadius: "var(--site-radius-lg)",
  padding: "16px 20px",
  fontSize: "14px",
  fontWeight: "600",
  backdropFilter: "blur(18px)",
  boxShadow: "var(--site-shadow-md)",
};

export const ecommerceToastOptions: DefaultToastOptions = {
  duration: 4000,
  className: ecommerceFeedbackStyles.toastBase,
  style: baseToastStyle,
  success: {
    className: `${ecommerceFeedbackStyles.toastBase} ${ecommerceFeedbackStyles.toastSuccess}`,
    style: baseToastStyle,
    iconTheme: {
      primary: "var(--site-color-success)",
      secondary: "var(--site-color-surface-inset)",
    },
  },
  error: {
    className: `${ecommerceFeedbackStyles.toastBase} ${ecommerceFeedbackStyles.toastError}`,
    style: baseToastStyle,
    iconTheme: {
      primary: "var(--site-color-danger)",
      secondary: "var(--site-color-surface-inset)",
    },
  },
  loading: {
    className: `${ecommerceFeedbackStyles.toastBase} ${ecommerceFeedbackStyles.toastLoading}`,
    style: baseToastStyle,
  },
};
