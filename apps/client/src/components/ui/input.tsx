import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.ComponentProps<"input">;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full min-w-0 rounded-xl border border-primary-soft bg-muted/60 px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground",
          "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-muted/30",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
