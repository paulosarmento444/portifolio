"use client";

import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "./utils/cn";
import { IconButton } from "./actions";

type ModalSize = "sm" | "md" | "lg" | "xl";
type DrawerSide = "left" | "right" | "bottom";

const modalSizeClassMap: Record<ModalSize, string> = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

const drawerSideClassMap: Record<DrawerSide, string> = {
  left: "inset-y-0 left-0 h-full w-full max-w-xl border-r",
  right: "inset-y-0 right-0 h-full w-full max-w-xl border-l",
  bottom: "inset-x-0 bottom-0 w-full rounded-t-[var(--site-radius-xl)] rounded-b-none border-t",
};

const overlayBaseClassName =
  "fixed inset-0 z-[100] bg-[color:var(--site-color-overlay-scrim)] backdrop-blur-md backdrop-saturate-150";
const panelBaseClassName =
  "site-surface-strong border-[color:var(--site-color-border)] text-[color:var(--site-color-foreground)] ring-1 ring-inset ring-[color:var(--site-color-border)]";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([type='hidden']):not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

const getFocusableElements = (container: HTMLElement | null) => {
  if (!container) {
    return [];
  }

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );
};

interface OverlayShellProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  contentClassName?: string;
  className?: string;
  overlayClassName?: string;
  panelId?: string;
}

export interface ModalShellProps extends OverlayShellProps {
  size?: ModalSize;
}

export function ModalShell({
  isOpen,
  onClose,
  title,
  description,
  actions,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  size = "md",
  className,
  contentClassName,
  overlayClassName,
  panelId,
}: Readonly<ModalShellProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    queueMicrotask(() => {
      const focusableElements = getFocusableElements(panelRef.current);
      const initialFocusTarget = focusableElements[0] ?? panelRef.current;
      initialFocusTarget?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(panelRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className={cn(overlayBaseClassName, overlayClassName)}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          panelBaseClassName,
          "relative z-[101] flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-[var(--site-radius-xl)] p-6 shadow-[var(--site-shadow-lg)] sm:max-h-[90vh] sm:p-8",
          modalSizeClassMap[size],
          className,
        )}
      >
        {(title || description || actions || showCloseButton) && (
          <div className="mb-6 flex items-start justify-between gap-4 border-b border-[color:var(--site-color-border)] pb-5">
            <div className="site-stack-panel min-w-0 flex-1">
              {title ? (
                <h2 id={titleId} className="site-text-section-title">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id={descriptionId} className="site-text-body">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="site-stack-action-row justify-end">
              {actions}
              {showCloseButton ? (
                <IconButton icon={<X className="h-4 w-4" />} label="Fechar" onClick={onClose} />
              ) : null}
            </div>
          </div>
        )}
        <div className={cn("site-stack-section min-h-0 overflow-y-auto", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export interface DrawerShellProps extends OverlayShellProps {
  side?: DrawerSide;
}

export function DrawerShell({
  isOpen,
  onClose,
  title,
  description,
  actions,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  side = "right",
  className,
  contentClassName,
  overlayClassName,
  panelId,
}: Readonly<DrawerShellProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    queueMicrotask(() => {
      const focusableElements = getFocusableElements(panelRef.current);
      const initialFocusTarget = focusableElements[0] ?? panelRef.current;
      initialFocusTarget?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(panelRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const isBottom = side === "bottom";

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className={cn(overlayBaseClassName, overlayClassName)}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <aside
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          panelBaseClassName,
          "fixed z-[101] flex max-h-[100vh] flex-col overflow-hidden shadow-[var(--site-shadow-lg)]",
          drawerSideClassMap[side],
          isBottom ? "h-auto min-h-[45vh] p-5 sm:p-6" : "p-5 sm:p-6",
          className,
        )}
      >
        {(title || description || actions || showCloseButton) && (
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-[color:var(--site-color-border)] pb-4">
            <div className="site-stack-panel min-w-0 flex-1">
              {title ? (
                <h2 id={titleId} className="site-text-card-title text-[color:var(--site-color-foreground-strong)]">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id={descriptionId} className="site-text-body text-sm">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="site-stack-action-row justify-end">
              {actions}
              {showCloseButton ? (
                <IconButton icon={<X className="h-4 w-4" />} label="Fechar" onClick={onClose} />
              ) : null}
            </div>
          </div>
        )}
        <div className={cn("site-stack-section overflow-y-auto pr-1", contentClassName)}>{children}</div>
      </aside>
    </div>
  );
}

export interface OverlaySectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function OverlaySection({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: Readonly<OverlaySectionProps>) {
  return (
    <section
      className={cn(
        "site-stack-panel rounded-[var(--site-radius-lg)] border border-[color:var(--site-color-border)] bg-[color:var(--site-color-interactive-muted)]/50 p-4 sm:p-5",
        className,
      )}
      {...props}
    >
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="site-stack-panel min-w-0 flex-1">
            {title ? <h3 className="site-text-card-title">{title}</h3> : null}
            {description ? <p className="site-text-body text-sm">{description}</p> : null}
          </div>
          {actions ? <div className="site-stack-action-row justify-end sm:self-start">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
