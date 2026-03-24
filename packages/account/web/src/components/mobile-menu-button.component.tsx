"use client";

import { ChevronDown, ChevronUp, Menu } from "lucide-react";
import { SecondaryButton } from "@site/shared";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  currentLabel: string;
  controlsId?: string;
}

export function MobileMenuButton({
  isOpen,
  onToggle,
  currentLabel,
  controlsId,
}: MobileMenuButtonProps) {
  return (
    <SecondaryButton
      onClick={onToggle}
      fullWidth
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls={controlsId}
      leadingIcon={<Menu className="h-4 w-4" />}
      trailingIcon={
        isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      }
      className="justify-between px-4"
    >
      <span className="flex min-w-0 flex-1 flex-col items-start">
        <span className="font-semibold">Menu da conta</span>
        <span className="site-text-meta text-left normal-case tracking-normal">
          {currentLabel}
        </span>
      </span>
    </SecondaryButton>
  );
}
