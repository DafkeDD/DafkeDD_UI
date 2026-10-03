"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { CountUp } from "../lib/count-up";
import { formatCompact } from "../lib/chart-utils";

export interface GaugeThreshold {
  /** Vanaf welke waarde deze kleur geldt. */
  from: number;
  tone: "accent" | "green" | "amber" | "red";
}

export interface GaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  /** Hoeveel graden de boog beslaat; 180 is een halve cirkel. */
  sweep?: number;
  label?: React.ReactNode;
  /** Tekst in het midden; standaard de waarde. */
  valueLabel?: React.ReactNode;
  unit?: React.ReactNode;
  tone?: "accent" | "green" | "amber" | "red";
  thresholds?: GaugeThreshold[];
  /** Streepje op een doelwaarde. */
  target?: number;
  /** Waardes bij het begin en het einde van de boog tonen. */
  showBounds?: boolean;
  formatValue?: (value: number) => string;
}

const TONEN: Record<string, string> = {
  accent: "var(--accent)",
  green: "var(--green)",
  amber: "var(--amber)",
  red: "var(--red)",
};

/** Punt op de boog bij een hoek in graden, gerekend vanaf links. */
function opBoog(cx: number, cy: number, r: number, hoek: number) {
  const rad = (hoek * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function boogPad(cx: number, cy: number, r: number, van: number, tot: number) {
  const start = opBoog(cx, cy, r, van);
  const eind = opBoog(cx, cy, r, tot);
  const groot = Math.abs(tot - van) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${groot} 1 ${eind.x} ${eind.y}`;
}

/**
 * Gauge — halve of driekwart boog met één waarde in het midden. Kleurt mee met
 * drempels, precies zoals Meter, maar dan rond.
 */
export const Gauge = React.forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  {
    value,
    min = 0,
    max = 100,
    size = 180,
    thickness = 14,
    sweep = 220,
    label,
    valueLabel,
    unit,
    tone,
    thresholds,
    target,
    showBounds,
    formatValue,
    className,
    ...rest
  },
  ref
) {
  const bereik = max - min || 1;
  const deel = Math.min(Math.max((value - min) / bereik, 0), 1);

  const gekozen =
    tone ??
    (thresholds
      ? [...thresholds]
          .sort((a, b) => a.from - b.from)
          .reduce<GaugeThreshold["tone"]>(
            (huidig, drempel) => (value >= drempel.from ? drempel.tone : huidig),
            thresholds[0]?.tone ?? "accent"
          )
      : "accent");

  const start = 90 + (360 - sweep) / 2;
  const eind = start + sweep;
  const cx = size / 2;
  const straal = (size - thickness) / 2;

  /* De hoogte volgt het laagste punt van de boog, niet de hele cirkel; anders
     staat er onder een halve of driekwart boog een hoop lege ruimte. */
  const raaktOnderkant = (start <= 90 && eind >= 90) || (start <= 450 && eind >= 450);
  const laagste = raaktOnderkant
    ? 1
    : Math.max(Math.sin((start * Math.PI) / 180), Math.sin((eind * Math.PI) / 180));
  const hoogte = Math.ceil(cx + straal * laagste + thickness / 2 + 2);

  const opmaak = (waarde: number) => (formatValue ? formatValue(waarde) : formatCompact(waarde));
  const doelHoek = target !== undefined ? start + Math.min(Math.max((target - min) / bereik, 0), 1) * sweep : null;

  return (
    <div ref={ref} className={cn("lui-gauge", className)} {...rest}>
      <div className="lui-gauge-figure" style={{ width: size, height: hoogte, paddingBottom: showBounds ? 16 : 0 }}>
        <svg width={size} height={hoogte} viewBox={`0 0 ${size} ${hoogte}`} role="img" aria-hidden="true">
          <path
            d={boogPad(cx, cx, straal, start, eind)}
            className="lui-gauge-track"
            strokeWidth={thickness}
          />
          {deel > 0 && (
            <path
              d={boogPad(cx, cx, straal, start, start + deel * sweep)}
              className="lui-gauge-fill"
              pathLength={1}
              stroke={TONEN[gekozen]}
              strokeWidth={thickness}
            />
          )}
          {doelHoek !== null && (
            <line
              x1={opBoog(cx, cx, straal - thickness / 2 - 2, doelHoek).x}
              y1={opBoog(cx, cx, straal - thickness / 2 - 2, doelHoek).y}
              x2={opBoog(cx, cx, straal + thickness / 2 + 2, doelHoek).x}
              y2={opBoog(cx, cx, straal + thickness / 2 + 2, doelHoek).y}
              className="lui-gauge-target"
            />
          )}
        </svg>

        <div className="lui-gauge-center" style={{ top: cx }}>
          <span className="lui-gauge-value" style={{ color: TONEN[gekozen] }}>
            <CountUp value={valueLabel ?? opmaak(value)} />
            {unit}
          </span>
          {label && <span className="lui-gauge-label">{label}</span>}
        </div>

        {showBounds && (
          <>
            <span
              className="lui-gauge-bound"
              style={{ left: opBoog(cx, cx, straal, start).x, top: opBoog(cx, cx, straal, start).y + thickness }}
            >
              {opmaak(min)}
            </span>
            <span
              className="lui-gauge-bound"
              style={{ left: opBoog(cx, cx, straal, eind).x, top: opBoog(cx, cx, straal, eind).y + thickness }}
            >
              {opmaak(max)}
            </span>
          </>
        )}
      </div>

      <span
        role="meter"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={typeof label === "string" ? label : undefined}
        className="lui-gauge-sr"
      />
    </div>
  );
});
