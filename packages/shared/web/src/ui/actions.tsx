import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ecommerceButtonStyles, ecommerceLayoutRules } from "../design-system";
import { cn } from "./utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type IconButtonSize = "sm" | "md" | "lg";

const buttonVariantClassMap: Record<ButtonVariant, string> = {
  primary: ecommerceButtonStyles.primary,
  secondary: ecommerceButtonStyles.secondary,
  ghost: ecommerceButtonStyles.ghost,
};

const buttonSizeClassMap: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2.5 text-sm",
  md: "min-h-11 px-5 py-3 text-sm",
  lg: "min-h-12 px-6 py-3.5 text-base",
};

const iconButtonSizeClassMap: Record<IconButtonSize, string> = {
  sm: "h-10 w-10",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...props
}: Readonly<ButtonProps>) {
  return (
    <button
      type={type}
      className={cn(
        buttonVariantClassMap[variant],
        buttonSizeClassMap[size],
        "relative shrink-0 whitespace-nowrap ring-1 ring-transparent ring-offset-2 ring-offset-[color:var(--site-color-page)]",
        ecommerceLayoutRules.utilityClasses.touchTarget,
        ecommerceLayoutRules.utilityClasses.focusRing,
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span className="shrink-0">{trailingIcon}</span> : null}
    </button>
  );
}

export function PrimaryButton(props: Readonly<Omit<ButtonProps, "variant">>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Readonly<Omit<ButtonProps, "variant">>) {
  return <Button variant="secondary" {...props} />;
}

export function GhostButton(props: Readonly<Omit<ButtonProps, "variant">>) {
  return <Button variant="ghost" {...props} />;
}

export interface ChipFilterProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  leadingIcon?: ReactNode;
  trailingMeta?: ReactNode;
}

export function ChipFilter({
  active = false,
  leadingIcon,
  trailingMeta,
  className,
  children,
  type = "button",
  ...props
}: Readonly<ChipFilterProps>) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        ecommerceLayoutRules.utilityClasses.touchTarget,
        ecommerceLayoutRules.utilityClasses.focusRing,
        active
          ? "border-[color:var(--site-color-primary)] bg-[color:var(--site-color-primary-soft)] text-[color:var(--site-color-foreground-strong)] shadow-[var(--site-shadow-sm)]"
          : "border-[color:var(--site-color-border)] bg-[color:var(--site-color-interactive-muted)] text-[color:var(--site-color-foreground-muted)] hover:border-[color:var(--site-color-border-strong)] hover:bg-[color:var(--site-color-interactive-muted-hover)] hover:text-[color:var(--site-color-foreground)]",
        className,
      )}
      {...props}
    >
      {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
      <span>{children}</span>
      {trailingMeta ? <span className="text-xs opacity-80">{trailingMeta}</span> : null}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, "leadingIcon" | "trailingIcon" | "children" | "size"> {
  icon: ReactNode;
  label: string;
  size?: IconButtonSize;
}

export function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className,
  type = "button",
  ...props
}: Readonly<IconButtonProps>) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        buttonVariantClassMap[variant],
        "rounded-full p-0 ring-1 ring-transparent ring-offset-2 ring-offset-[color:var(--site-color-page)]",
        ecommerceLayoutRules.utilityClasses.touchTarget,
        ecommerceLayoutRules.utilityClasses.focusRing,
        iconButtonSizeClassMap[size],
        className,
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span className="inline-flex items-center justify-center">{icon}</span>
    </button>
  );
}
