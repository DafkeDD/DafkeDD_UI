"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface IndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Wat er in het hoekje komt: een getal, een stip of een klein icoon. */
  badge?: React.ReactNode;
  /** Hoek waar het hoekje hangt. */
  placement?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  tone?: "red" | "accent" | "green" | "amber" | "blue" | "neutral";
  /** Alleen een stip, zonder inhoud. */
  dot?: boolean;
  /** Verbergt het hoekje, bijvoorbeeld bij nul meldingen. */
  hidden?: boolean;
  /** Getallen boven dit maximum worden als "99+" getoond. */
  max?: number;
  label?: string;
  /** Zachte pulserende ring rond het hoekje, voor iets dat live is. */
  pulse?: boolean;
}

/**
 * Indicator — telbadge of stip op de hoek van iets anders: een knop, een
 * avatar, een tabblad.
 */
export const Indicator = React.forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator(
  { badge, placement = "top-right", tone = "red", dot, hidden, max = 99, label, pulse, className, children, ...rest },
  ref
) {
  const inhoud =
    typeof badge === "number" && badge > max ? `${max}+` : badge;

  return (
    <span ref={ref} className={cn("lui-indicator", className)} {...rest}>
      {children}
      {!hidden && (
        <span
          className={cn(
            "lui-indicator-badge",
            `lui-indicator-${tone}`,
            `lui-indicator-${placement}`,
            (dot || inhoud === undefined) && "lui-indicator-dot"
          )}
          aria-label={label}
          role={label ? "status" : undefined}
          aria-hidden={label ? undefined : true}
          data-pulse={pulse ? "" : undefined}
        >
          {/* Nieuwe waarde = nieuwe key, zodat het getal opnieuw binnen ploft. */}
          {!dot && inhoud !== undefined && (
            <span key={String(inhoud)} className="lui-indicator-count">
              {inhoud}
            </span>
          )}
        </span>
      )}
    </span>
  );
});
