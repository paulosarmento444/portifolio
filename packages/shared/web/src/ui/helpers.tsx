import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils/cn";
import { SurfaceCard, StatusBadge } from "./primitives";

type MediaAspect = "product" | "square" | "portrait" | "wide" | "video";
type StepStatus = "complete" | "current" | "upcoming";

const mediaAspectClassMap: Record<MediaAspect, string> = {
  product: "aspect-[4/5]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/10]",
  video: "aspect-video",
};

const stepStatusClassMap: Record<StepStatus, string> = {
  complete:
    "border-[color:var(--site-color-success-soft)] bg-[color:var(--site-color-success-soft)] text-[color:var(--site-color-success-text)]",
  current:
    "border-[color:var(--site-color-primary-soft)] bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-foreground-strong)]",
  upcoming:
    "border-[color:var(--site-color-border)] bg-[color:var(--site-color-interactive-muted)] text-[color:var(--site-color-foreground-muted)]",
};

export interface MediaFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  aspect?: MediaAspect;
  children: ReactNode;
  contentClassName?: string;
  padded?: boolean;
}

export function MediaFrame({
  aspect = "product",
  children,
  className,
  contentClassName,
  padded = false,
  ...props
}: Readonly<MediaFrameProps>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[calc(var(--site-radius-xl)+0.25rem)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-soft)] shadow-[var(--site-shadow-sm)]",
        mediaAspectClassMap[aspect],
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,var(--site-color-glow-primary-strong),transparent_42%)] opacity-80" />
      <div className={cn("relative h-full w-full", padded && "p-3 sm:p-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

export interface EditorialSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  compact?: boolean;
}

export function EditorialSurface({
  compact = false,
  className,
  children,
  ...props
}: Readonly<EditorialSurfaceProps>) {
  return (
    <SurfaceCard
      tone="strong"
      padding="none"
      className={cn(
        "mx-auto w-full max-w-[min(100%,var(--site-container-content))] overflow-hidden",
        compact ? "p-5 sm:p-6" : "p-6 sm:p-8 lg:p-10",
        className,
      )}
      {...props}
    >
      <div className="site-stack-section">{children}</div>
    </SurfaceCard>
  );
}

export interface TrustItem {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
}

export interface TrustListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: TrustItem[];
}

export function TrustList({ items, className, ...props }: Readonly<TrustListProps>) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)} {...props}>
      {items.map((item, index) => (
        <SurfaceCard
          key={`trust-${index}`}
          tone="soft"
          padding="compact"
          className="site-stack-panel"
        >
          <div className="flex items-start gap-3">
            {item.icon ? (
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-inset)] text-[color:var(--site-color-primary)]">
                {item.icon}
              </div>
            ) : null}
            <div className="site-stack-panel min-w-0 flex-1">
              <StatusBadge tone={item.tone ?? "neutral"}>{item.label}</StatusBadge>
              {item.description ? <p className="site-text-meta">{item.description}</p> : null}
            </div>
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}

export interface MetricItem {
  label: ReactNode;
  value: ReactNode;
  meta?: ReactNode;
}

export interface MetricRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: MetricItem[];
}

export function MetricRow({ items, className, ...props }: Readonly<MetricRowProps>) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)} {...props}>
      {items.map((item, index) => (
        <div
          key={`metric-${index}`}
          className="rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-interactive-muted)] px-4 py-3"
        >
          <div className="site-stack-panel">
            <span className="site-text-meta uppercase tracking-[0.12em]">{item.label}</span>
            <span className="text-lg font-semibold text-[color:var(--site-color-foreground-strong)]">
              {item.value}
            </span>
            {item.meta ? <span className="site-text-meta">{item.meta}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export interface ProgressStep {
  label: ReactNode;
  description?: ReactNode;
  status: StepStatus;
}

export interface ProgressStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  steps: ProgressStep[];
}

export function ProgressStepper({
  steps,
  className,
  ...props
}: Readonly<ProgressStepperProps>) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]", className)} {...props}>
      {steps.map((step, index) => (
        <div
          key={`${index}-${String(step.label)}`}
          className="site-stack-panel rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-surface-soft)] px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                stepStatusClassMap[step.status],
              )}
            >
              {index + 1}
            </span>
            <div className="site-stack-panel min-w-0 flex-1">
              <span className="text-sm font-semibold text-[color:var(--site-color-foreground-strong)]">
                {step.label}
              </span>
              {step.description ? <span className="site-text-meta">{step.description}</span> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
