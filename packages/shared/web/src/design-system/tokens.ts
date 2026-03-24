export const ecommercePremiumPolishAudit = {
  keep: {
    tokens: [
      "The semantic token naming already separates page, surface, foreground, border, and state colors well enough to refine instead of replace.",
      "The existing typography and spacing exports are already consumed as shared contracts and should remain the source of truth.",
      "Container categories for marketing, commerce, content, and utility pages are the correct abstraction for the storefront.",
    ],
    surfaces: [
      "Base surface, strong surface, soft surface, and inset field surfaces are still the right layering model.",
      "The current pill/button and card radius families are coherent and should be preserved.",
      "The shell, fade, and grid utility layers are still useful when applied with more restraint.",
    ],
    primitives: [
      "Shared primitives in packages/shared/web should remain the only visual foundation for cards, fields, buttons, overlays, and status cues.",
      "The app shell should keep global chrome ownership while features keep page ownership.",
      "Feature packages should continue consuming semantic classes and shared components instead of local token forks.",
    ],
  },
  refine: {
    tokens: [
      "The current system is too dark-first and needs a real premium light theme instead of an eventual inversion.",
      "Surface contrast needs more depth control so dark mode feels breathable and light mode feels crisp instead of washed out.",
      "Accent, overlay, and semantic colors need calmer contrast rules so commerce actions stay clearer than decorative treatments.",
    ],
    surfaces: [
      "Header, checkout, catalog, and account surfaces need stricter density rules and less stacked blur/glow.",
      "Overlay scrims and modal layers need better separation from background panels in both themes.",
      "Cards and action panels need tighter spacing and more predictable alignment across all page types.",
    ],
    primitives: [
      "Buttons, badges, and fields need theme-aware contrast tuning for both dark and light surfaces.",
      "Shared layout primitives need stricter page-shell, section, and action-row rhythm.",
      "Page-level shells need consistent container widths and vertical cadence across marketing, commerce, content, and utility flows.",
    ],
  },
  deprecate: {
    tokens: [
      "Dark-only assumptions in root theme variables.",
      "Glow-heavy color usage as a default shell treatment.",
      "Page-specific spacing overrides that bypass shared shell rhythm.",
    ],
    surfaces: [
      "Opaque decorative gradients competing with transactional surfaces.",
      "Overuse of elevated shadows to communicate hierarchy.",
      "Ad hoc panel spacing that creates misalignment between cards, filters, and summaries.",
    ],
    primitives: [
      "One-off neon or gradient styling in shell and utility flows.",
      "Feature-level overrides that restyle shared buttons or fields for layout fixes.",
      "Local container widths and top offsets outside the shared layout contract.",
    ],
  },
  visibleIssues: [
    "Visual density remains too heavy in dark mode, especially on product, checkout, and account flows.",
    "Header, action clusters, and card interiors still drift off a shared alignment rhythm.",
    "Spacing does not scale consistently between desktop, tablet, and mobile shells.",
  ],
} as const;

export const ecommerceVisualAudit = {
  layout: [
    "Page shells need stricter top/bottom rhythm and container alignment instead of local spacing fixes.",
    "Marketing, commerce, content, and utility flows should share the same spacing math while keeping different widths.",
    "Action rows, filter groups, and page headers need a common alignment contract.",
  ],
  components: [
    "Shared surfaces and primitives should be refined rather than replaced.",
    "Buttons, cards, fields, and overlays need calmer contrast and more consistent density.",
    "Decorative effects should be secondary to commerce clarity.",
  ],
  typography: [
    "Typography hierarchy is directionally correct but needs tighter page-title, section-title, and utility-text rhythm.",
    "Metadata and support copy need more stable contrast in both themes.",
    "Spacing between titles, descriptions, and actions must be normalized across page types.",
  ],
  ecommerceUx: [
    "Catalog, product, and checkout should feel lighter and more product-first.",
    "Utility pages should feel denser and calmer, not marketing-heavy.",
    "The theme system must support premium dark and light modes with consistent semantics.",
  ],
  keep: ecommercePremiumPolishAudit.keep,
  refine: ecommercePremiumPolishAudit.refine,
  deprecate: ecommercePremiumPolishAudit.deprecate,
} as const;

export const ecommerceThemeModes = ["dark", "light"] as const;

const sharedTypography = {
  display: "clamp(2.75rem, 5.5vw, 4.5rem)",
  pageTitle: "clamp(2.125rem, 4vw, 3.25rem)",
  sectionTitle: "clamp(1.625rem, 2.4vw, 2.375rem)",
  cardTitle: "clamp(1.0625rem, 1.4vw, 1.25rem)",
  body: "1rem",
  meta: "0.875rem",
  lineDisplay: 1,
  lineHeading: 1.08,
  lineCardTitle: 1.3,
  lineBody: 1.65,
  lineMeta: 1.5,
  letterDisplay: "-0.045em",
  letterHeading: "-0.03em",
  letterCardTitle: "-0.015em",
  letterEyebrow: "0.16em",
} as const;

const sharedSpacing = {
  "2xs": "0.25rem",
  xs: "0.5rem",
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "2.75rem",
  "3xl": "3.75rem",
  "4xl": "5rem",
  sectionCompactMobile: "2.75rem",
  sectionCompactDesktop: "3.5rem",
  sectionMobile: "4rem",
  sectionDesktop: "5.5rem",
  sectionHeroMobile: "4.5rem",
  sectionHeroDesktop: "7rem",
} as const;

const sharedRadii = {
  sm: "0.75rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  pill: "999px",
} as const;

const sharedBorders = {
  subtle: "1px solid var(--site-color-border)",
  strong: "1px solid var(--site-color-border-strong)",
  focus: "0 0 0 3px var(--site-color-primary-soft)",
  focusDanger: "0 0 0 3px var(--site-color-danger-soft)",
} as const;

const sharedLayout = {
  shellOffset: "5.25rem",
  inlinePadding: {
    base: "1rem",
    sm: "1.5rem",
    lg: "2rem",
    xl: "2.5rem",
  },
  pageShell: {
    top: "calc(5.25rem + 1.25rem)",
    topDesktop: "calc(5.25rem + 1.75rem)",
    topCompact: "calc(5.25rem + 0.75rem)",
    bottom: "3.5rem",
    bottomCompact: "2.75rem",
    bottomDesktop: "4.5rem",
  },
  cards: {
    defaultMobile: "1.125rem",
    defaultDesktop: "1.5rem",
    compactMobile: "0.9375rem",
    compactDesktop: "1.125rem",
  },
  stackRhythm: {
    pageMobile: "2.25rem",
    pageTablet: "2.75rem",
    pageDesktop: "3.5rem",
    sectionMobile: "1.25rem",
    sectionDesktop: "1.75rem",
    panelMobile: "0.875rem",
    panelDesktop: "1.125rem",
    actionRow: "0.75rem",
    actionRowDesktop: "1rem",
  },
  sections: {
    defaultMobile: "4rem",
    defaultDesktop: "5.5rem",
    compactMobile: "2.75rem",
    compactDesktop: "3.5rem",
    heroMobile: "4.5rem",
    heroDesktop: "7rem",
  },
  containers: {
    marketing: "80rem",
    commerce: "76rem",
    content: "48rem",
    utility: "70rem",
  },
  breakpoints: {
    mobile: "0px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
  },
} as const;

export const ecommerceThemeTokens = {
  dark: {
    colorScheme: "dark",
    colors: {
      page: "#0f172a",
      pageAlt: "#162033",
      surface: "rgba(18, 27, 43, 0.74)",
      surfaceStrong: "rgba(24, 35, 56, 0.9)",
      surfaceSoft: "rgba(24, 35, 56, 0.6)",
      surfaceInset: "rgba(10, 15, 28, 0.78)",
      foreground: "#e5edf7",
      foregroundStrong: "#f8fbff",
      foregroundMuted: "#c6d2e1",
      foregroundSoft: "#91a2b8",
      border: "rgba(148, 163, 184, 0.18)",
      borderStrong: "rgba(148, 163, 184, 0.3)",
      primary: "#2dd4bf",
      primaryStrong: "#0f766e",
      primarySoft: "rgba(45, 212, 191, 0.16)",
      primaryContrast: "#032a26",
      secondary: "#f59e0b",
      secondarySoft: "rgba(245, 158, 11, 0.16)",
      secondaryContrast: "#452103",
      success: "#22c55e",
      successSoft: "rgba(34, 197, 94, 0.16)",
      successText: "#bbf7d0",
      danger: "#f43f5e",
      dangerSoft: "rgba(244, 63, 94, 0.16)",
      dangerText: "#fecdd3",
      info: "#38bdf8",
      infoSoft: "rgba(56, 189, 248, 0.16)",
      infoText: "#bae6fd",
      interactiveMuted: "rgba(226, 232, 240, 0.07)",
      interactiveMutedHover: "rgba(226, 232, 240, 0.12)",
      gridOverlay: "rgba(255, 255, 255, 0.04)",
      overlayScrim: "rgba(2, 6, 23, 0.7)",
      selection: "rgba(45, 212, 191, 0.26)",
      glowPrimary: "rgba(45, 212, 191, 0.06)",
      glowPrimaryStrong: "rgba(45, 212, 191, 0.1)",
      glowSecondary: "rgba(245, 158, 11, 0.06)",
      fadeMid: "rgba(15, 23, 42, 0.16)",
      fadeStrong: "rgba(15, 23, 42, 0.38)",
    },
    shadows: {
      sm: "0 10px 30px rgba(2, 8, 23, 0.2)",
      md: "0 22px 52px rgba(2, 8, 23, 0.28)",
      lg: "0 30px 80px rgba(2, 8, 23, 0.36)",
      focus: "0 0 0 3px rgba(45, 212, 191, 0.22)",
      focusDanger: "0 0 0 3px rgba(244, 63, 94, 0.18)",
    },
    gradients: {
      accent: "linear-gradient(135deg, #2dd4bf 0%, #f59e0b 100%)",
      text: "linear-gradient(135deg, #f8fbff 0%, #8ef2e4 46%, #f7ca6f 100%)",
      fade:
        "linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.16) 18%, rgba(15, 23, 42, 0.38) 46%, #0f172a 100%)",
      shell:
        "linear-gradient(180deg, rgba(22, 32, 51, 0.96) 0%, rgba(15, 23, 42, 0.98) 100%)",
    },
  },
  light: {
    colorScheme: "light",
    colors: {
      page: "#f6f8fb",
      pageAlt: "#eef3f8",
      surface: "rgba(255, 255, 255, 0.92)",
      surfaceStrong: "rgba(255, 255, 255, 0.98)",
      surfaceSoft: "rgba(248, 250, 252, 0.86)",
      surfaceInset: "rgba(240, 245, 250, 0.96)",
      foreground: "#102132",
      foregroundStrong: "#08111d",
      foregroundMuted: "#41556a",
      foregroundSoft: "#66778a",
      border: "rgba(148, 163, 184, 0.22)",
      borderStrong: "rgba(100, 116, 139, 0.3)",
      primary: "#0f766e",
      primaryStrong: "#115e59",
      primarySoft: "rgba(15, 118, 110, 0.12)",
      primaryContrast: "#ecfeff",
      secondary: "#d97706",
      secondarySoft: "rgba(217, 119, 6, 0.12)",
      secondaryContrast: "#fff7ed",
      success: "#15803d",
      successSoft: "rgba(21, 128, 61, 0.12)",
      successText: "#166534",
      danger: "#dc2626",
      dangerSoft: "rgba(220, 38, 38, 0.12)",
      dangerText: "#991b1b",
      info: "#0284c7",
      infoSoft: "rgba(2, 132, 199, 0.12)",
      infoText: "#0c4a6e",
      interactiveMuted: "rgba(15, 23, 42, 0.04)",
      interactiveMutedHover: "rgba(15, 23, 42, 0.08)",
      gridOverlay: "rgba(15, 23, 42, 0.05)",
      overlayScrim: "rgba(15, 23, 42, 0.34)",
      selection: "rgba(15, 118, 110, 0.18)",
      glowPrimary: "rgba(15, 118, 110, 0.04)",
      glowPrimaryStrong: "rgba(15, 118, 110, 0.07)",
      glowSecondary: "rgba(217, 119, 6, 0.05)",
      fadeMid: "rgba(226, 232, 240, 0.58)",
      fadeStrong: "rgba(226, 232, 240, 0.94)",
    },
    shadows: {
      sm: "0 12px 24px rgba(15, 23, 42, 0.08)",
      md: "0 20px 40px rgba(15, 23, 42, 0.12)",
      lg: "0 30px 60px rgba(15, 23, 42, 0.14)",
      focus: "0 0 0 3px rgba(15, 118, 110, 0.18)",
      focusDanger: "0 0 0 3px rgba(220, 38, 38, 0.14)",
    },
    gradients: {
      accent: "linear-gradient(135deg, #0f766e 0%, #d97706 100%)",
      text: "linear-gradient(135deg, #08111d 0%, #0f766e 46%, #d97706 100%)",
      fade:
        "linear-gradient(180deg, rgba(246, 248, 251, 0) 0%, rgba(226, 232, 240, 0.58) 18%, rgba(226, 232, 240, 0.94) 46%, #f6f8fb 100%)",
      shell:
        "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 248, 251, 0.98) 100%)",
    },
  },
} as const;

export const ecommerceDesignTokens = {
  defaultTheme: "dark",
  modes: ecommerceThemeModes,
  themes: ecommerceThemeTokens,
  typography: sharedTypography,
  spacing: sharedSpacing,
  radii: sharedRadii,
  borders: sharedBorders,
  layout: sharedLayout,
  defaultThemeTokens: ecommerceThemeTokens.dark,
} as const;
