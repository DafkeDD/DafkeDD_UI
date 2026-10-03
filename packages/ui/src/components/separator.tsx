"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Optioneel label in het midden van de lijn. */
  label?: React.ReactNode;
}

/** Separator — dunne scheidingslijn, optioneel met label. */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", label, className, ...rest },
  ref
) {
  if (label) {
    return (
      <div ref={ref} className={cn("lui-separator-labelled", className)} {...rest}>
        <span className="lui-separator-line" />
        <span className="lui-separator-label">{label}</span>
        <span className="lui-separator-line" />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cn("lui-separator", `lui-separator-${orientation}`, className)}
      {...rest}
    />
  );
});
