"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface PeriodNavProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tekst tussen de pijlen, bv. "Week 12 · 16–20 mrt". */
  label: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Toont een knop die terugspringt naar vandaag. */
  onToday?: () => void;
  todayLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  disablePrevious?: boolean;
  disableNext?: boolean;
  size?: "sm" | "md";
  /** "boxed" zet de pijlen in een grijs kader, zoals in de planningsbalk. */
  variant?: "plain" | "boxed";
}

/** PeriodNav — vorige/volgende door weken, maanden of elke andere periode. */
export const PeriodNav = React.forwardRef<HTMLDivElement, PeriodNavProps>(function PeriodNav(
  {
    label,
    onPrevious,
    onNext,
    onToday,
    todayLabel = "Vandaag",
    previousLabel = "Vorige periode",
    nextLabel = "Volgende periode",
    disablePrevious,
    disableNext,
    size = "md",
    variant = "boxed",
    className,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-periodnav", `lui-periodnav-${variant}`, `lui-periodnav-${size}`, className)}
      {...rest}
    >
      <button
        type="button"
        className="lui-periodnav-btn"
        aria-label={previousLabel}
        disabled={disablePrevious}
        onClick={onPrevious}
      >
        <Icon name="chevronLeft" size={size === "sm" ? 14 : 16} />
      </button>

      <span className="lui-periodnav-label">{label}</span>

      <button
        type="button"
        className="lui-periodnav-btn"
        aria-label={nextLabel}
        disabled={disableNext}
        onClick={onNext}
      >
        <Icon name="chevronRight" size={size === "sm" ? 14 : 16} />
      </button>

      {onToday && (
        <button type="button" className="lui-periodnav-today" onClick={onToday}>
          {todayLabel}
        </button>
      )}
    </div>
  );
});
