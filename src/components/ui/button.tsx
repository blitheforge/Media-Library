import * as React from "react";
import { cn } from "../../utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants = {
  primary: "bg-[var(--bfml-primary)] text-[var(--bfml-primary-foreground)] shadow-[var(--bfml-shadow)] hover:brightness-95",
  secondary:
    "border border-[var(--bfml-border)] bg-[var(--bfml-surface)] text-[var(--bfml-foreground)] shadow-[var(--bfml-shadow)] hover:bg-[var(--bfml-surface-soft)]",
  danger: "bg-[var(--bfml-destructive)] text-[var(--bfml-primary-foreground)] hover:brightness-95",
  ghost: "bg-transparent text-[var(--bfml-muted-foreground)] hover:bg-[var(--bfml-surface-soft)] hover:text-[var(--bfml-foreground)]"
};

export function Button({ className, variant = "primary", disabled, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
