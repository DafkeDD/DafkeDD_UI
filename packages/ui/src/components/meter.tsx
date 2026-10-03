"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { CountUp } from "../lib/count-up";

export interface MeterThreshold {
  /** Vanaf welke waarde deze toon geldt. */
  from: number;
  tone: "accent" | "green" | "amber" | "red";
}

export interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  label?: React.ReactNode;
  /** Tekst rechts; standaard de waarde met eenheid. */
  valueLabel?: React.ReactNode;
  unit?: React.ReactNode;
  /** Vaste toon; laat weg om de drempels te gebruiken. */
  tone?: "accent" | "green" | "amber" | "red";
  /** Drempels van laag naar hoog, bv. [{from:0,tone:"green"},{from:70,tone:"amber"}]. */
  thresholds?: MeterThreshold[];
  size?: "sm" | "md" | "lg";
  /** Streepje op de balk, bv. een doel of limiet. */
  marker?: number;
  markerLabel?: React.ReactNode;
}

/**
 * Meter — een waarde binnen een bereik, zoals schijfruimte of belasting. Anders
 * dan Progress gaat het hier niet om voortgang maar om een toestand, dus komt
 * er ook een kleur bij de drempel die je meegeeft.
 */
export const Meter = React.forwardRef<HTMLDivElement, MeterProps>(function Meter(
  {
    value,
    min = 0,
    max = 100,
    label,
    valueLabel,
    unit,
    tone,
    thresholds,
    size = "md",
    marker,
    markerLabel,
    className,
    ...rest
  },
  ref
) {
  const bereik = Math.max(max - min, 1);
  const deel = Math.min(Math.max((value - min) / bereik, 0), 1);

  const gekozen =
    tone ??
    (thresholds
      ? [...thresholds].sort((a, b) => a.from - b.from).reduce<MeterThreshold["tone"]>(
          (huidig, drempel) => (value >= drempel.from ? drempel.tone : huidig),
          thresholds[0]?.tone ?? "accent"
        )
      : "accent");

  return (
    <div
      ref={ref}
      data-size={size}
      data-tone={gekozen}
      className={cn("lui-meter", className)}
      {...rest}
    >
      {(label || valueLabel || unit) && (
        <div className="lui-meter-head">
          {label && <span className="lui-meter-label">{label}</span>}
          <span className="lui-meter-value">
            <CountUp value={valueLabel ?? value} />
            {unit}
          </span>
        </div>
      )}
      <div
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={typeof label === "string" ? label : undefined}
        className="lui-meter-track"
      >
        <span className="lui-meter-fill" style={{ width: `${deel * 100}%` }} />
        {marker !== undefined && (
          <span
            className="lui-meter-marker"
            style={{ insetInlineStart: `${Math.min(Math.max((marker - min) / bereik, 0), 1) * 100}%` }}
            title={typeof markerLabel === "string" ? markerLabel : undefined}
            aria-hidden="true"
          />
        )}
      </div>
      {marker !== undefined && markerLabel ? (
        <div className="lui-meter-foot">
          <span
            className="lui-meter-marker-label"
            style={{ insetInlineStart: `${Math.min(Math.max((marker - min) / bereik, 0), 1) * 100}%` }}
          >
            {markerLabel}
          </span>
        </div>
      ) : null}
    </div>
  );
});
