"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import {
  ChartAxisY,
  ChartGrid,
  ChartTooltip,
  chartColor,
  formatCompact,
  niceScale,
  useChartWidth,
} from "../lib/chart-utils";
import { ChartLegend } from "./chart";

export interface ScatterPoint {
  x: number;
  y: number;
  /** Derde grootheid; bepaalt de straal van de stip. */
  size?: number;
  label?: string;
}

export interface ScatterSeries {
  name: string;
  points: ScatterPoint[];
  color?: string;
}

export interface ScatterChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: ScatterSeries[];
  height?: number;
  /** Naam onder de horizontale as. */
  xLabel?: React.ReactNode;
  /** Naam links van de verticale as. */
  yLabel?: React.ReactNode;
  grid?: boolean;
  xTicks?: number;
  yTicks?: number;
  legend?: boolean;
  tooltip?: boolean;
  /** Kleinste en grootste straal wanneer punten een `size` hebben. */
  sizeRange?: [number, number];
  formatX?: (value: number) => string;
  formatY?: (value: number) => string;
  emptyLabel?: React.ReactNode;
}

interface Actief {
  reeks: number;
  punt: number;
}

/**
 * ScatterChart — punten op twee doorlopende assen, met een optionele derde
 * grootheid als grootte van de stip (bubble chart).
 */
export const ScatterChart = React.forwardRef<HTMLDivElement, ScatterChartProps>(function ScatterChart(
  {
    series,
    height = 260,
    xLabel,
    yLabel,
    grid = true,
    xTicks = 6,
    yTicks = 5,
    legend = true,
    tooltip = true,
    sizeRange = [4, 16],
    formatX,
    formatY,
    emptyLabel = "Geen gegevens",
    className,
    ...rest
  },
  ref
) {
  const vlak = React.useRef<HTMLDivElement>(null);
  const breedte = useChartWidth(vlak);
  const [actief, setActief] = React.useState<Actief | null>(null);

  const alle = series.flatMap((reeks) => reeks.points);
  const leeg = alle.length === 0;

  const opmaakX = React.useCallback(
    (waarde: number) => (formatX ? formatX(waarde) : formatCompact(waarde)),
    [formatX]
  );
  const opmaakY = React.useCallback(
    (waarde: number) => (formatY ? formatY(waarde) : formatCompact(waarde)),
    [formatY]
  );

  const xSchaal = niceScale(Math.min(...alle.map((p) => p.x), 0), Math.max(...alle.map((p) => p.x), 0), xTicks);
  const ySchaal = niceScale(Math.min(...alle.map((p) => p.y), 0), Math.max(...alle.map((p) => p.y), 0), yTicks);

  const groottes = alle.map((p) => p.size ?? 0);
  const maxGrootte = Math.max(...groottes, 0);

  const marge = { top: 12, right: 14, bottom: xLabel ? 42 : 26, left: yLabel ? 58 : 46 };
  const binnenBreedte = Math.max(breedte - marge.left - marge.right, 10);
  const binnenHoogte = Math.max(height - marge.top - marge.bottom, 10);

  const toX = (waarde: number) =>
    marge.left + ((waarde - xSchaal.min) / (xSchaal.max - xSchaal.min || 1)) * binnenBreedte;
  const toY = (waarde: number) =>
    marge.top + binnenHoogte - ((waarde - ySchaal.min) / (ySchaal.max - ySchaal.min || 1)) * binnenHoogte;
  const straal = (punt: ScatterPoint) => {
    if (!punt.size || maxGrootte <= 0) return sizeRange[0];
    /* Oppervlakte schaalt met de waarde, anders lijkt het verschil te groot. */
    const deel = Math.sqrt(punt.size / maxGrootte);
    return sizeRange[0] + deel * (sizeRange[1] - sizeRange[0]);
  };

  if (leeg) {
    return (
      <div ref={ref} className={cn("lui-chart", className)} {...rest}>
        <div className="lui-chart-empty">{emptyLabel}</div>
      </div>
    );
  }

  const gekozen = actief ? series[actief.reeks]?.points[actief.punt] : undefined;

  return (
    <div ref={ref} className={cn("lui-chart", className)} {...rest}>
      <div className="lui-chart-plot" ref={vlak} style={{ height }}>
        <svg
          width={breedte}
          height={height}
          viewBox={`0 0 ${breedte} ${height}`}
          role="img"
          aria-label={`Spreidingsdiagram met ${alle.length} punten`}
        >
          {grid && <ChartGrid ticks={ySchaal.ticks} toY={toY} x1={marge.left} x2={breedte - marge.right} />}
          <ChartAxisY ticks={ySchaal.ticks} toY={toY} x={marge.left - 10} format={opmaakY} />

          <line
            x1={marge.left}
            x2={breedte - marge.right}
            y1={marge.top + binnenHoogte}
            y2={marge.top + binnenHoogte}
            className="lui-chart-axis"
          />
          <g aria-hidden="true">
            {xSchaal.ticks.map((tick) => (
              <text
                key={tick}
                x={toX(tick)}
                y={marge.top + binnenHoogte + 16}
                textAnchor="middle"
                className="lui-chart-tick"
              >
                {opmaakX(tick)}
              </text>
            ))}
          </g>

          {xLabel && (
            <text x={marge.left + binnenBreedte / 2} y={height - 4} textAnchor="middle" className="lui-chart-axis-title">
              {xLabel}
            </text>
          )}
          {yLabel && (
            <text
              transform={`rotate(-90 12 ${marge.top + binnenHoogte / 2})`}
              x={12}
              y={marge.top + binnenHoogte / 2}
              textAnchor="middle"
              className="lui-chart-axis-title"
            >
              {yLabel}
            </text>
          )}

          {series.map((reeks, reeksIndex) => {
            const kleur = chartColor(reeksIndex, reeks.color);
            return (
              <g key={reeks.name}>
                {reeks.points.map((punt, puntIndex) => (
                  <circle
                    key={puntIndex}
                    cx={toX(punt.x)}
                    cy={toY(punt.y)}
                    r={straal(punt)}
                    fill={kleur}
                    className="lui-chart-point"
                    style={{ "--i": puntIndex + reeksIndex * 3 } as React.CSSProperties}
                    data-active={
                      actief?.reeks === reeksIndex && actief?.punt === puntIndex ? "" : undefined
                    }
                    onPointerEnter={
                      tooltip ? () => setActief({ reeks: reeksIndex, punt: puntIndex }) : undefined
                    }
                    onPointerLeave={tooltip ? () => setActief(null) : undefined}
                  >
                    <title>{`${punt.label ?? reeks.name}: ${opmaakX(punt.x)} / ${opmaakY(punt.y)}`}</title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>

        {actief && gekozen && (
          <ChartTooltip
            x={toX(gekozen.x)}
            y={toY(gekozen.y)}
            containerWidth={breedte}
            title={gekozen.label ?? series[actief.reeks].name}
            items={[
              { label: xLabel ?? "x", value: opmaakX(gekozen.x), color: chartColor(actief.reeks, series[actief.reeks].color) },
              { label: yLabel ?? "y", value: opmaakY(gekozen.y) },
              ...(gekozen.size !== undefined ? [{ label: "grootte", value: formatCompact(gekozen.size) }] : []),
            ]}
          />
        )}
      </div>

      {legend && series.length > 0 && (
        <ChartLegend
          items={series.map((reeks, index) => ({ label: reeks.name, color: chartColor(index, reeks.color) }))}
        />
      )}
    </div>
  );
});
