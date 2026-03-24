export const ecommerceLayoutRules = {
  inlinePadding: {
    base: "px-4",
    sm: "sm:px-6",
    lg: "lg:px-8",
    xl: "xl:px-10",
  },
  pageShells: {
    default: "site-page-shell",
    compact: "site-page-shell site-page-shell-compact",
    marketing: "site-page-shell site-page-shell-marketing",
    utility: "site-page-shell site-page-shell-compact",
  },
  containers: {
    base: "site-container",
    marketing: "site-container site-container-marketing",
    commerce: "site-container site-container-commerce",
    content: "site-container site-container-content",
    utility: "site-container site-container-utility",
  },
  sections: {
    default: "site-section",
    compact: "site-section site-section-compact",
    hero: "site-section site-section-hero",
    utility: "site-section site-section-utility",
  },
  spacingRhythm: {
    page: "site-stack-page",
    section: "site-stack-section",
    panel: "site-stack-panel",
    actionRow: "site-stack-action-row",
    pageMobile: "2.25rem",
    pageTablet: "2.75rem",
    pageDesktop: "3.5rem",
    sectionGapMobile: "1.25rem",
    sectionGapDesktop: "1.75rem",
    panelGapMobile: "0.875rem",
    panelGapDesktop: "1.125rem",
    actionRowGapMobile: "0.75rem",
    actionRowGapDesktop: "1rem",
    sectionMobile: "4rem",
    sectionDesktop: "5.5rem",
    sectionCompactMobile: "2.75rem",
    sectionCompactDesktop: "3.5rem",
  },
  cardPadding: {
    defaultMobile: "1.125rem",
    defaultDesktop: "1.5rem",
    compactMobile: "0.9375rem",
    compactDesktop: "1.125rem",
  },
  stacks: {
    page: "site-stack-page",
    section: "site-stack-section",
    panel: "site-stack-panel",
    actionRow: "site-stack-action-row",
  },
  pageIntro: {
    compact: "site-page-intro site-page-intro-compact",
    default: "site-page-intro",
    hero: "site-page-intro site-page-intro-hero",
  },
  readableWidths: {
    xs: "site-readable-xs",
    sm: "site-readable-sm",
    md: "site-readable-md",
    lg: "site-readable-lg",
    full: "max-w-none",
  },
  utilityClasses: {
    focusRing: "site-focus-ring",
    focusRingDanger: "site-focus-ring-danger",
    touchTarget: "site-touch-target",
    touchTargetCompact: "site-touch-target-compact",
    actionCluster: "site-action-cluster",
  },
  alignmentRules: {
    marketing:
      "Keep headline, support copy, and primary actions aligned to a shared start edge with generous vertical breathing room.",
    commerce:
      "Align filters, result meta, CTAs, media, and summaries to a denser grid with clear start and end rails.",
    content:
      "Keep long-form reading surfaces narrow, centered, and visually separated from supporting metadata and related content.",
    utility:
      "Use compact shells, tighter card rhythm, and clear action rows so account, auth, and order flows feel task-oriented.",
  },
  responsiveRules: {
    marketing:
      "Use for home, hero, brand storytelling, and merchandising sections with broader widths and deeper section spacing.",
    commerce:
      "Use for catalog, product, cart, and checkout flows where scanability and summary visibility matter most.",
    content:
      "Use for blog detail and editorial layouts where reading width and metadata rhythm matter more than density.",
    utility:
      "Use for auth, account, support, and order-history flows where calm utility spacing is more important than visual drama.",
  },
} as const;
