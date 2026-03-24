import type { HTMLAttributes, ReactNode } from "react";
import { ecommerceLayoutRules, ecommerceSurfaceStyles, ecommerceTextStyles } from "../design-system";
import { cn } from "./utils/cn";

type ContainerVariant = Exclude<keyof typeof ecommerceLayoutRules.containers, "base">;
type SectionSpacing = keyof typeof ecommerceLayoutRules.sections;
type StackVariant = keyof typeof ecommerceLayoutRules.stacks;
type SurfaceTone = "default" | "strong" | "soft";
type SurfacePadding = "default" | "compact" | "none";
type SurfaceElement = "div" | "section" | "article" | "aside";
type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
type HeaderAlign = "left" | "center";
type HeaderDensity = "compact" | "default" | "hero";
type ReadableWidth = keyof typeof ecommerceLayoutRules.readableWidths;

const containerClassMap: Record<ContainerVariant, string> = {
  marketing: ecommerceLayoutRules.containers.marketing,
  commerce: ecommerceLayoutRules.containers.commerce,
  content: ecommerceLayoutRules.containers.content,
  utility: ecommerceLayoutRules.containers.utility,
};

const sectionClassMap: Record<SectionSpacing, string> = {
  default: ecommerceLayoutRules.sections.default,
  compact: ecommerceLayoutRules.sections.compact,
  hero: ecommerceLayoutRules.sections.hero,
  utility: ecommerceLayoutRules.sections.utility,
};

const stackClassMap: Record<StackVariant, string> = {
  page: ecommerceLayoutRules.stacks.page,
  section: ecommerceLayoutRules.stacks.section,
  panel: ecommerceLayoutRules.stacks.panel,
  actionRow: ecommerceLayoutRules.stacks.actionRow,
};

const surfaceToneClassMap: Record<SurfaceTone, string> = {
  default: ecommerceSurfaceStyles.base,
  strong: ecommerceSurfaceStyles.strong,
  soft: ecommerceSurfaceStyles.soft,
};

const surfacePaddingClassMap: Record<SurfacePadding, string> = {
  default: "p-[var(--site-card-padding)] md:p-[var(--site-card-padding-desktop)]",
  compact:
    "p-[var(--site-card-compact-padding)] md:p-[var(--site-card-compact-padding-desktop)]",
  none: "",
};

const statusToneClassMap: Record<StatusTone, string> = {
  neutral:
    "border-[color:var(--site-color-border)] bg-[color:var(--site-color-interactive-muted)] text-[color:var(--site-color-foreground-muted)]",
  accent:
    "border-[color:var(--site-color-primary-soft)] bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-primary)]",
  success:
    "border-[color:var(--site-color-success-soft)] bg-[color:var(--site-color-success-soft)] text-[color:var(--site-color-success-text)]",
  warning:
    "border-[color:var(--site-color-secondary-soft)] bg-[color:var(--site-color-secondary-soft)] text-[color:var(--site-color-secondary)]",
  danger:
    "border-[color:var(--site-color-danger-soft)] bg-[color:var(--site-color-danger-soft)] text-[color:var(--site-color-danger-text)]",
  info:
    "border-[color:var(--site-color-info-soft)] bg-[color:var(--site-color-info-soft)] text-[color:var(--site-color-info-text)]",
};

const pageHeaderAlignClassMap: Record<HeaderAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
};

export interface SectionShellProps extends HTMLAttributes<HTMLElement> {
  container?: ContainerVariant;
  spacing?: SectionSpacing;
  stack?: StackVariant;
  as?: "section" | "div" | "article";
  contentClassName?: string;
}

export function SectionShell({
  container = "commerce",
  spacing = "default",
  stack = "section",
  as = "section",
  className,
  contentClassName,
  children,
  ...props
}: Readonly<SectionShellProps>) {
  const Component = as;

  return (
    <Component className={cn(sectionClassMap[spacing], className)} {...props}>
      <div className={cn(containerClassMap[container], stackClassMap[stack], contentClassName)}>
        {children}
      </div>
    </Component>
  );
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: HeaderAlign;
  container?: ContainerVariant;
  compact?: boolean;
  divider?: boolean;
  density?: HeaderDensity;
  contentWidth?: ReadableWidth;
  descriptionWidth?: ReadableWidth;
  actionsClassName?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  container = "commerce",
  compact = false,
  divider = false,
  density,
  contentWidth = "lg",
  descriptionWidth = "md",
  actionsClassName,
  className,
  ...props
}: Readonly<PageHeaderProps>) {
  const resolvedDensity = density ?? (compact ? "compact" : "default");

  return (
    <header className={cn(containerClassMap[container], className)} {...props}>
      <div
        className={cn(
          ecommerceLayoutRules.pageIntro[resolvedDensity],
          "flex w-full border-b border-transparent pb-0",
          divider && "border-[color:var(--site-color-border)] pb-5 sm:pb-6",
          pageHeaderAlignClassMap[align],
        )}
      >
        {eyebrow ? <div className={ecommerceTextStyles.eyebrow}>{eyebrow}</div> : null}
        <div
          className={cn(
            "site-stack-panel",
            ecommerceLayoutRules.readableWidths[contentWidth],
            align === "center" && "mx-auto",
          )}
        >
          <h1 className={ecommerceTextStyles.pageTitle}>{title}</h1>
          {description ? (
            <div
              className={cn(
                ecommerceTextStyles.body,
                ecommerceLayoutRules.readableWidths[descriptionWidth],
                align === "center" && "mx-auto",
              )}
            >
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div
            className={cn(
              ecommerceLayoutRules.utilityClasses.actionCluster,
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  padding?: SurfacePadding;
  interactive?: boolean;
  as?: SurfaceElement;
}

export function SurfaceCard({
  tone = "default",
  padding = "default",
  interactive = false,
  as = "div",
  className,
  children,
  ...props
}: Readonly<SurfaceCardProps>) {
  const Component = as;
  const baseClass = cn(surfaceToneClassMap[tone], surfacePaddingClassMap[padding]);

  return (
    <Component
      className={cn(
        baseClass,
        "relative overflow-hidden ring-1 ring-inset ring-transparent",
        padding === "none" && "p-0",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--site-color-border-strong)] hover:shadow-[var(--site-shadow-md)] hover:ring-[color:var(--site-color-primary-soft)]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  subtle?: boolean;
  leadingVisual?: ReactNode;
}

export function StatusBadge({
  tone = "neutral",
  subtle = false,
  leadingVisual,
  className,
  children,
  ...props
}: Readonly<StatusBadgeProps>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.1em] uppercase",
        statusToneClassMap[tone],
        subtle && "border-transparent bg-transparent px-0 py-0 text-[color:inherit]",
        className,
      )}
      {...props}
    >
      {leadingVisual ? <span className="shrink-0">{leadingVisual}</span> : null}
      {children}
    </span>
  );
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: SurfaceTone;
}

export function EmptyState({
  icon,
  eyebrow,
  title,
  description,
  action,
  tone = "soft",
  className,
  ...props
}: Readonly<EmptyStateProps>) {
  return (
    <SurfaceCard
      tone={tone}
      padding="default"
      className={cn("site-stack-panel items-center text-center", className)}
      {...props}
    >
      {icon ? (
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] text-[color:var(--site-color-primary)] shadow-[var(--site-shadow-sm)]">
          {icon}
        </div>
      ) : null}
      {eyebrow ? <div className={ecommerceTextStyles.eyebrow}>{eyebrow}</div> : null}
      <div className="site-stack-panel max-w-2xl">
        <h2 className={ecommerceTextStyles.sectionTitle}>{title}</h2>
        {description ? <div className={ecommerceTextStyles.body}>{description}</div> : null}
      </div>
      {action ? <div className={ecommerceLayoutRules.stacks.actionRow}>{action}</div> : null}
    </SurfaceCard>
  );
}
