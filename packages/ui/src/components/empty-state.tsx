"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Knoppen onderaan. */
  action?: React.ReactNode;
  size?: "sm" | "md";
}

/** EmptyState — lege lijst, geen resultaten, nog niets ingesteld. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon, title, description, action, size = "md", className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-empty", `lui-empty-${size}`, className)} {...rest}>
      {icon && <div className="lui-empty-icon">{icon}</div>}
      <div className="lui-empty-title">{title}</div>
      {description && <p className="lui-empty-description">{description}</p>}
      {children}
      {action && <div className="lui-empty-action">{action}</div>}
    </div>
  );
});
