import { ComponentProps, ReactNode } from "react";
import { tv, VariantProps } from "tailwind-variants";
import { cn } from "@/app/lib/utils";

const buttonVariants = tv({
  base: "rounded-lg flex items-center justify-center gap-2 transition-colors duration-300",

  variants: {
    variant: {
      primary:
        "bg-lime-300 text-lime-950 hover:bg-lime-400 disabled:bg-zinc-800 disabled:text-zinc-500",
      secondary:
        "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500",
      custom:
        "bg-emerald-600 text-gray-50 hover:bg-emerald-500 disabled:opacity-50",
      red: "bg-red-500 text-gray-50 hover:bg-red-400 disabled:opacity-50",
    },
    size: {
      default: "px-5 py-2",
      full: "w-full h-11 px-5",
    },
  },

  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

interface ButtonProps
  extends ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "default",
  className,
  ...rest
}: Readonly<ButtonProps>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}
