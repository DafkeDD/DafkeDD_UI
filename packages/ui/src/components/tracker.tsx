"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { VisuallyHidden } from "./visually-hidden";

export type TrackerTone = "green" | "amber" | "red" | "accent" | "neutral";

export interface TrackerBlock {
  tone: TrackerTone;
  /** Tekst in de tooltip; zonder tekst blijft het blokje stil. */
  tooltip?: React.ReactNode;
  label?: string;
  color?: string;
}

export interface TrackerProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TrackerBlock[];
  size?: "sm" | "md" | "lg";
  /** Tekst links en rechts onder de reeks, bv. "30 dagen geleden" en "vandaag". */
  startLabel?: React.ReactNode;
  endLabel?: React.ReactNode;
  /** Toegankelijke naam voor de hele reeks. */
  label?: string;
  emptyLabel?: React.ReactNode;
}

/**
 * Tracker — één blokje per periode, gekleurd naar status. De statuspagina-strook
 * voor uptime, builds of dagelijkse controles.
 */
export const Tracker = React.forwardRef<HTMLDivElement, TrackerProps>(function Tracker(
  { data, size = "md", startLabel, endLabel, label, emptyLabel = "Geen gegevens", className, ...rest },
  ref
) {
  const [actief, setActief] = React.useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div ref={ref} className={cn("lui-tracker", className)} {...rest}>
        <div className="lui-chart-empty">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("lui-tracker", `lui-tracker-${size}`, className)} {...rest}>
      <div className="lui-tracker-row" role="img" aria-label={label}>
        {data.map((blok, index) => (
          <span
            key={index}
            className="lui-tracker-block"
            data-tone={blok.tone}
            style={{ "--i": index, ...(blok.color ? { background: blok.color } : null) } as React.CSSProperties}
            onPointerEnter={() => setActief(index)}
            onPointerLeave={() => setActief((huidig) => (huidig === index ? null : huidig))}
          >
            {blok.label && <VisuallyHidden>{blok.label}</VisuallyHidden>}
            {actief === index && blok.tooltip !== undefined && (
              <span className="lui-tracker-tip" role="tooltip">
                {blok.tooltip}
              </span>
            )}
          </span>
        ))}
      </div>
      {(startLabel || endLabel) && (
        <div className="lui-tracker-foot">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      )}
    </div>
  );
});
