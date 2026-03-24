import type { HTMLAttributes, ReactNode } from "react";
import { ecommerceLayoutRules, ecommerceTextStyles } from "../design-system";
import { cn } from "./utils/cn";
import { PageHeader, SurfaceCard, type PageHeaderProps } from "./primitives";

type ReadableWidth = keyof typeof ecommerceLayoutRules.readableWidths;

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbTrailProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  renderLink?: (item: BreadcrumbItem, className: string) => ReactNode;
}

export function BreadcrumbTrail({
  items,
  separator = <span aria-hidden="true">›</span>,
  renderLink,
  className,
  ...props
}: Readonly<BreadcrumbTrailProps>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("w-full", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[color:var(--site-color-foreground-soft)]">
        {items.map((item, index) => {
          const isCurrent = item.current ?? index === items.length - 1;
          const linkClassName = cn(
            "inline-flex items-center rounded-full px-3 py-1.5 transition-colors",
            ecommerceLayoutRules.utilityClasses.touchTargetCompact,
            ecommerceLayoutRules.utilityClasses.focusRing,
            isCurrent
              ? "font-medium text-[color:var(--site-color-foreground-strong)]"
              : "text-[color:var(--site-color-foreground-soft)] hover:text-[color:var(--site-color-foreground-strong)]",
          );

          return (
            <li key={`${index}-${String(item.label)}`} className="inline-flex items-center gap-1.5">
              {item.href && !isCurrent ? (
                renderLink ? (
                  renderLink(item, linkClassName)
                ) : (
                  <a href={item.href} className={linkClassName}>
                    {item.label}
                  </a>
                )
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1.5",
                    isCurrent
                      ? "font-medium text-[color:var(--site-color-foreground-strong)]"
                      : "text-[color:var(--site-color-foreground-soft)]",
                  )}
                >
                  {item.label}
                </span>
              )}
              {index < items.length - 1 ? (
                <span className="text-[color:var(--site-color-foreground-soft)]">{separator}</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface EditorialIntroProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  aside?: ReactNode;
  align?: PageHeaderProps["align"];
  density?: PageHeaderProps["density"];
  contentWidth?: PageHeaderProps["contentWidth"];
  descriptionWidth?: PageHeaderProps["descriptionWidth"];
}

export function EditorialIntro({
  eyebrow,
  title,
  description,
  actions,
  meta,
  aside,
  align = "left",
  density = "default",
  contentWidth = "lg",
  descriptionWidth = "md",
  className,
  ...props
}: Readonly<EditorialIntroProps>) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:gap-8",
        Boolean(aside) &&
          align === "left" &&
          "lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.42fr)] lg:items-end",
        className,
      )}
      {...props}
    >
      <div className="site-stack-section">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
          align={align}
          density={density}
          contentWidth={contentWidth}
          descriptionWidth={descriptionWidth}
        />
        {meta ? <div className="site-action-cluster text-sm text-[color:var(--site-color-foreground-soft)]">{meta}</div> : null}
      </div>
      {aside ? <div className="min-w-0">{aside}</div> : null}
    </div>
  );
}

export interface MerchandisingFeatureProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "children"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  media?: ReactNode;
  highlights?: ReactNode;
  reverse?: boolean;
  contentWidth?: ReadableWidth;
}

export function MerchandisingFeature({
  eyebrow,
  title,
  description,
  actions,
  media,
  highlights,
  reverse = false,
  contentWidth = "md",
  className,
  ...props
}: Readonly<MerchandisingFeatureProps>) {
  return (
    <SurfaceCard
      tone="strong"
      className={cn(
        "overflow-hidden",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] lg:items-center",
          reverse && "lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1fr)]",
        )}
      >
        <div className={cn("site-stack-section", reverse && "lg:order-2")}>
          {eyebrow ? <div className={ecommerceTextStyles.eyebrow}>{eyebrow}</div> : null}
          <div className={cn("site-page-intro-content", ecommerceLayoutRules.readableWidths[contentWidth])}>
            <h2 className={ecommerceTextStyles.sectionTitle}>{title}</h2>
            {description ? <p className={ecommerceTextStyles.body}>{description}</p> : null}
          </div>
          {highlights ? <div className="site-action-cluster">{highlights}</div> : null}
          {actions ? <div className="site-action-cluster">{actions}</div> : null}
        </div>

        {media ? (
          <div className={cn("min-w-0", reverse && "lg:order-1")}>
            {media}
          </div>
        ) : null}
      </div>
    </SurfaceCard>
  );
}

export interface InstitutionalSupportItem {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

export interface InstitutionalSupportBlockProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  title?: ReactNode;
  description?: ReactNode;
  items: InstitutionalSupportItem[];
  compact?: boolean;
}

export function InstitutionalSupportBlock({
  title,
  description,
  items,
  compact = false,
  className,
  ...props
}: Readonly<InstitutionalSupportBlockProps>) {
  return (
    <SurfaceCard
      tone="soft"
      className={cn("site-stack-section", compact && "gap-4", className)}
      {...props}
    >
      {title || description ? (
        <div className="site-page-intro site-page-intro-compact">
          {title ? (
            <h3 className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
              {title}
            </h3>
          ) : null}
          {description ? <p className="site-text-body site-readable-sm text-sm">{description}</p> : null}
        </div>
      ) : null}

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div
            key={`${index}-${String(item.label)}`}
            className="flex items-start gap-3 rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface)] px-4 py-3"
          >
            {item.icon ? (
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] text-[color:var(--site-color-primary)]">
                {item.icon}
              </div>
            ) : null}
            <div className="site-stack-panel min-w-0 flex-1 gap-1.5">
              <p className="site-text-card-title text-base text-[color:var(--site-color-foreground-strong)]">
                {item.label}
              </p>
              {item.description ? <p className="site-text-body text-sm">{item.description}</p> : null}
            </div>
            {item.action ? <div className="shrink-0">{item.action}</div> : null}
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
