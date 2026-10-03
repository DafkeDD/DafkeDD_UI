"use client";
import * as React from "react";
import { variants } from "../lib/variants";

const badge = variants({
  base: "lui-badge",
  variants: {
    tone: {
      neutral: "lui-badge-neutral",
      accent: "lui-badge-accent",
      green: "lui-badge-green",
      amber: "lui-badge-amber",
      red: "lui-badge-red",
      blue: "lui-badge-blue",
      violet: "lui-badge-violet",
    },
    size: { sm: "lui-badge-sm", md: "" },
  },
  defaultVariants: { tone: "neutral", size: "md" },
});

export type BadgeTone = "neutral" | "accent" | "green" | "amber" | "red" | "blue" | "violet";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: "sm" | "md";
  /** Statusbolletje links van het label. */
  dot?: boolean;
  icon?: React.ReactNode;
  /** Laat het statusbolletje pulseren (bv. "live", "bezig"). */
  pulse?: boolean;
}

/** Badge — compact label voor status, categorie of telling. */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone, size, dot, icon, pulse, className, children, ...rest },
  ref
) {
  return (
    <span ref={ref} className={badge({ tone, size, className })} {...rest}>
      {dot && <span className="lui-badge-dot" data-pulse={pulse ? "" : undefined} aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
});
