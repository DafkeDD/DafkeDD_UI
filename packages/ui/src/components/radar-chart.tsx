"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { chartColor, formatCompact, niceScale, type ChartSeries } from "../lib/chart-utils";
import { ChartLegend } from "./chart";

export interface RadarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Eén naam per as, met de klok mee vanaf boven. */
  axes: string[];
  /** Per reeks één waarde per as, in dezelfde volgorde. */
  series: ChartSeries[];
  size?: number;
  /** Aantal ringen in het web. */
  rings?: number;
  /** Bovengrens van de assen; standaard afgeleid uit de data. */
  max?: number;
  /** Vlak onder de lijn vullen. */
  filled?: boolean;
  /** Stip op elk hoekpunt. */
  dots?: boolean;
  legend?: boolean;
  formatValue?: (value: number) => string;
  emptyLabel?: React.ReactNode;
}

/**
 * RadarChart — spinnenweb waarin elke reeks een veelhoek vormt. Goed om een
 * handvol dimensies naast elkaar te leggen: scores, profielen, capaciteiten.
 */
export const RadarChart = React.forwardRef<HTMLDivElement, RadarChartProps>(function RadarChart(
  {
    axes,
    series,
    size = 260,
    rings = 4,
    max,
    filled = true,
    dots = true,
    legend = true,
    formatValue,
    emptyLabel = "Geen gegevens",
    className,
    ...rest
  },
  ref
) {
  const aantal = axes.length;
  const leeg = aantal < 3 || series.length === 0;

  const alle = series.flatMap((reeks) => reeks.data);
  const bovengrens = max ?? niceScale(0, Math.max(...alle, 1), rings).max;

  /* Ruimte laten voor de labels rond het web. */
  const marge = 34;
  const midden = size / 2;
  const straal = Math.max(midden - marge, 20);

  const punt = (index: number, waarde: number) => {
    const hoek = (index / aantal) * Math.PI * 2 - Math.PI / 2;
    const r = (Math.min(Math.max(waarde, 0), bovengrens) / (bovengrens || 1)) * straal;
    return { x: midden + r * Math.cos(hoek), y: midden + r * Math.sin(hoek) };
  };

  const opmaak = (waarde: number) => (formatValue ? formatValue(waarde) : formatCompact(waarde));

  if (leeg) {
    return (
      <div ref={ref} className={cn("lui-radar", className)} {...rest}>
        <div className="lui-chart-empty">{emptyLabel}</div>
      </div>
    );
  }

  const ringWaarden = Array.from({ length: rings }, (_, i) => ((i + 1) / rings) * bovengrens);

  return (
    <div ref={ref} className={cn("lui-radar", className)} {...rest}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Radargrafiek met ${aantal} assen en ${series.length} reeks${series.length === 1 ? "" : "en"}`}
      >
        <g aria-hidden="true">
          {ringWaarden.map((waarde) => (
            <polygon
              key={waarde}
              points={axes.map((_, index) => {
                const p = punt(index, waarde);
                return `${p.x},${p.y}`;
              }).join(" ")}
              className="lui-radar-ring"
            />
          ))}
          {axes.map((_, index) => {
            const p = punt(index, bovengrens);
            return <line key={index} x1={midden} y1={midden} x2={p.x} y2={p.y} className="lui-radar-spoke" />;
          })}
        </g>

        {series.map((reeks, reeksIndex) => {
          const kleur = chartColor(reeksIndex, reeks.color);
          const punten = axes.map((_, index) => punt(index, reeks.data[index] ?? 0));
          return (
            <g
              key={reeks.name}
              className="lui-radar-series"
              style={{ transformOrigin: `${midden}px ${midden}px`, "--i": reeksIndex } as React.CSSProperties}
            >
              <polygon
                points={punten.map((p) => `${p.x},${p.y}`).join(" ")}
                fill={kleur}
                stroke={kleur}
                className={cn("lui-radar-shape", !filled && "lui-radar-shape-open")}
              />
              {dots &&
                punten.map((p, index) => (
                  <circle key={index} cx={p.x} cy={p.y} r={3.5} fill={kleur} className="lui-chart-dot">
                    <title>{`${reeks.name} — ${axes[index]}: ${opmaak(reeks.data[index] ?? 0)}`}</title>
                  </circle>
                ))}
            </g>
          );
        })}

        <g aria-hidden="true">
          {axes.map((as, index) => {
            const p = punt(index, bovengrens * 1.16);
            const links = p.x < midden - 4;
            const rechts = p.x > midden + 4;
            return (
              <text
                key={as}
                x={p.x}
                y={p.y}
                dy="0.32em"
                textAnchor={links ? "end" : rechts ? "start" : "middle"}
                className="lui-chart-tick"
              >
                {as}
              </text>
            );
          })}
        </g>
      </svg>

      {legend && (
        <ChartLegend
          items={series.map((reeks, index) => ({ label: reeks.name, color: chartColor(index, reeks.color) }))}
        />
      )}
    </div>
  );
});
