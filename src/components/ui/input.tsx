import * as React from "react";
import { cn } from "../../utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-[var(--bfml-border)] bg-[var(--bfml-surface)] px-4 text-sm text-[var(--bfml-foreground)] shadow-[var(--bfml-shadow)] outline-none transition placeholder:text-[var(--bfml-muted-foreground)] focus:border-[var(--bfml-primary-border)] focus:ring-4 focus:ring-[var(--bfml-primary-soft)]",
        className
      )}
      {...props}
    />
  );
});
