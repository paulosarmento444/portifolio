export const ecommerceTextStyles = {
  display: "site-text-display",
  pageTitle: "site-text-page-title",
  sectionTitle: "site-text-section-title",
  cardTitle: "site-text-card-title",
  body: "site-text-body",
  meta: "site-text-meta",
  eyebrow: "site-eyebrow",
  gradient: "site-text-gradient",
} as const;

export const ecommerceSurfaceStyles = {
  base: "site-surface",
  strong: "site-surface-strong",
  soft: "site-surface-soft",
  card: "site-card",
  compactCard: "site-card-compact",
  divider: "site-divider",
} as const;

export const ecommerceButtonStyles = {
  primary: "site-button site-button-primary",
  secondary: "site-button site-button-secondary",
  ghost: "site-button site-button-ghost",
} as const;

export const ecommerceFieldStyles = {
  label: "site-label",
  input: "site-field",
  select: "site-field site-field-select",
  textarea: "site-field site-field-textarea",
  invalid: "site-field-invalid",
  helper: "site-helper-text",
  helperDanger: "site-helper-text site-helper-text-danger",
} as const;

export const ecommerceUtilityStyles = {
  shellBackground: "site-shell-background",
  fadeGradient: "site-fade-gradient",
  gridOverlay: "site-grid-overlay",
  accentGradient: "site-accent-gradient",
  shadowSoft: "site-shadow-soft",
  shadowStrong: "site-shadow-strong",
} as const;

export const ecommerceFeedbackStyles = {
  toastBase:
    "border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-strong)] text-[color:var(--site-color-foreground-strong)] shadow-[var(--site-shadow-md)] backdrop-blur-[18px]",
  toastSuccess:
    "border-[color:var(--site-color-success-soft)] bg-[color:var(--site-color-surface-strong)] text-[color:var(--site-color-foreground-strong)]",
  toastError:
    "border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-surface-strong)] text-[color:var(--site-color-foreground-strong)]",
  toastLoading:
    "border-[color:var(--site-color-border-strong)] bg-[color:var(--site-color-surface-strong)] text-[color:var(--site-color-foreground-strong)]",
} as const;
