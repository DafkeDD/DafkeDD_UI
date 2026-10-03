"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import {
  ChartAxisX,
  ChartAxisY,
  ChartGrid,
  ChartTooltip,
  chartColor,
  formatCompact,
  linePath,
  niceScale,
  useChartHover,
  useChartWidth,
  type ChartPoint,
  type ChartSeries,
} from "../lib/chart-utils";
import { ChartLegend } from "./chart";

export interface ComboChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Eén label per kolom; bepaalt de x-as. */
  labels: string[];
  /** Reeksen als staaf, op de linkeras. */
  bars?: ChartSeries[];
  /** Reeksen als lijn; standaard op een eigen rechteras. */
  lines?: ChartSeries[];
  height?: number;
  /** Staven op elkaar in plaats van naast elkaar. */
  stackedBars?: boolean;
  /** Lijnen mee op de linkeras zetten in plaats van een tweede as. */
  sharedAxis?: boolean;
  curved?: boolean;
  grid?: boolean;
  yTicks?: number;
  legend?: boolean;
  tooltip?: boolean;
  formatBarValue?: (value: number) => string;
  formatLineValue?: (value: number) => string;
  maxLabels?: number;
  emptyLabel?: React.ReactNode;
}

/**
 * ComboChart — staven en lijnen in één grafiek, elk met een eigen as.
 * Typisch omzet in staven en een percentage of gemiddelde als lijn.
 */
export const ComboChart = React.forwardRef<HTMLDivElement, ComboChartProps>(function ComboChart(
  {
    labels,
    bars = [],
    lines = [],
    height = 240,
    stackedBars,
    sharedAxis,
    curved = true,
    grid = true,
    yTicks = 5,
    legend = true,
    tooltip = true,
    formatBarValue,
    formatLineValue,
    maxLabels = 8,
    emptyLabel = "Geen gegevens",
    className,
    ...rest
  },
  ref
) {
  const vlak = React.useRef<HTMLDivElement>(null);
  const breedte = useChartWidth(vlak);

  const aantal = labels.length;
  const leeg = aantal === 0 || (bars.length === 0 && lines.length === 0);

  const opmaakBar = React.useCallback(
    (waarde: number) => (formatBarValue ? formatBarValue(waarde) : formatCompact(waarde)),
    [formatBarValue]
  );
  const opmaakLijn = React.useCallback(
    (waarde: number) => (formatLineValue ? formatLineValue(waarde) : formatCompact(waarde)),
    [formatLineValue]
  );

  /* Gestapelde staven: de as moet het totaal per kolom aankunnen. */
  const staafTotalen = React.useMemo(() => {
    if (!stackedBars) return bars.flatMap((reeks) => reeks.data);
    return labels.map((_, i) => bars.reduce((som, reeks) => som + (reeks.data[i] ?? 0), 0));
  }, [bars, labels, stackedBars]);

  const lijnWaarden = lines.flatMap((reeks) => reeks.data);
  const linksSchaal = niceScale(
    Math.min(0, ...staafTotalen, ...(sharedAxis ? lijnWaarden : [])),
    Math.max(0, ...staafTotalen, ...(sharedAxis ? lijnWaarden : [])),
    yTicks
  );
  const rechtsSchaal = niceScale(Math.min(0, ...lijnWaarden), Math.max(0, ...lijnWaarden), yTicks);
  const tweedeAs = !sharedAxis && lines.length > 0;

  const marge = { top: 10, right: tweedeAs ? 46 : 10, bottom: 24, left: 46 };
  const binnenBreedte = Math.max(breedte - marge.left - marge.right, 10);
  const binnenHoogte = Math.max(height - marge.top - marge.bottom, 10);

  const bandBreedte = binnenBreedte / Math.max(aantal, 1);
  const midden = (index: number) => marge.left + bandBreedte * (index + 0.5);
  const toYLinks = (waarde: number) =>
    marge.top +
    binnenHoogte -
    ((waarde - linksSchaal.min) / (linksSchaal.max - linksSchaal.min || 1)) * binnenHoogte;
  const toYRechts = (waarde: number) =>
    marge.top +
    binnenHoogte -
    ((waarde - rechtsSchaal.min) / (rechtsSchaal.max - rechtsSchaal.min || 1)) * binnenHoogte;
  const toYLijn = sharedAxis ? toYLinks : toYRechts;

  const hover = useChartHover(aantal, marge.left + bandBreedte / 2, bandBreedte);
  const actief = tooltip ? hover.index : null;

  if (leeg) {
    return (
      <div ref={ref} className={cn("lui-chart", className)} {...rest}>
        <div className="lui-chart-empty">{emptyLabel}</div>
      </div>
    );
  }

  const nullijn = toYLinks(Math.max(linksSchaal.min, 0));
  const groepBreedte = bandBreedte * 0.68;
  const staafBreedte = stackedBars ? groepBreedte : groepBreedte / Math.max(bars.length, 1);

  return (
    <div ref={ref} className={cn("lui-chart", className)} {...rest}>
      <div className="lui-chart-plot" ref={vlak} style={{ height }}>
        <svg
          width={breedte}
          height={height}
          viewBox={`0 0 ${breedte} ${height}`}
          role="img"
          aria-label={`Grafiek met ${bars.length} staafreeks(en) en ${lines.length} lijnreeks(en)`}
          onPointerMove={tooltip ? hover.onPointerMove : undefined}
          onPointerLeave={tooltip ? hover.onPointerLeave : undefined}
        >
          {grid && <ChartGrid ticks={linksSchaal.ticks} toY={toYLinks} x1={marge.left} x2={breedte - marge.right} />}
          <ChartAxisY ticks={linksSchaal.ticks} toY={toYLinks} x={marge.left - 10} format={opmaakBar} />
          {tweedeAs && (
            <ChartAxisY
              ticks={rechtsSchaal.ticks}
              toY={toYRechts}
              x={breedte - marge.right + 10}
              format={opmaakLijn}
              right
            />
          )}

          {/* staven */}
          {bars.map((reeks, reeksIndex) => {
            const kleur = chartColor(reeksIndex, reeks.color);
            const stapels = new Array(aantal).fill(0);
            return (
              <g key={`bar-${reeks.name}`}>
                {labels.map((_, i) => {
                  const waarde = reeks.data[i] ?? 0;
                  if (stackedBars) {
                    for (let j = 0; j < reeksIndex; j += 1) stapels[i] += bars[j].data[i] ?? 0;
                  }
                  const onderkant = stackedBars ? toYLinks(stapels[i]) : nullijn;
                  const bovenkant = stackedBars ? toYLinks(stapels[i] + waarde) : toYLinks(waarde);
                  const x = stackedBars
                    ? midden(i) - groepBreedte / 2
                    : midden(i) - groepBreedte / 2 + reeksIndex * staafBreedte;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={Math.min(bovenkant, onderkant)}
                      width={Math.max(staafBreedte - 1.5, 1)}
                      height={Math.max(Math.abs(onderkant - bovenkant), 1)}
                      fill={kleur}
                      className="lui-chart-bar"
                      style={{ "--i": i } as React.CSSProperties}
                      data-dim={actief !== null && actief !== i ? "" : undefined}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* lijnen */}
          {lines.map((reeks, index) => {
            const punten: ChartPoint[] = reeks.data
              .slice(0, aantal)
              .map((waarde, i) => ({ x: midden(i), y: toYLijn(waarde) }));
            const kleur = chartColor(bars.length + index, reeks.color);
            return (
              <path
                key={`line-${reeks.name}`}
                d={linePath(punten, curved)}
                stroke={kleur}
                pathLength={1}
                className="lui-chart-line lui-chart-draw"
                style={{ "--i": index + 2 } as React.CSSProperties}
              />
            );
          })}

          {actief !== null && (
            <g>
              <line
                x1={midden(actief)}
                x2={midden(actief)}
                y1={marge.top}
                y2={marge.top + binnenHoogte}
                className="lui-chart-crosshair"
              />
              {lines.map((reeks, index) => {
                const waarde = reeks.data[actief];
                if (waarde === undefined) return null;
                return (
                  <circle
                    key={reeks.name}
                    cx={midden(actief)}
                    cy={toYLijn(waarde)}
                    r={4}
                    fill={chartColor(bars.length + index, reeks.color)}
                    className="lui-chart-dot"
                  />
                );
              })}
            </g>
          )}

          <ChartAxisX labels={labels} toX={midden} y={height - 6} maxLabels={maxLabels} />
        </svg>

        {actief !== null && (
          <ChartTooltip
            x={midden(actief)}
            y={marge.top + binnenHoogte / 2}
            containerWidth={breedte}
            title={labels[actief]}
            items={[
              ...bars.map((reeks, index) => ({
                label: reeks.name,
                value: opmaakBar(reeks.data[actief] ?? 0),
                color: chartColor(index, reeks.color),
              })),
              ...lines.map((reeks, index) => ({
                label: reeks.name,
                value: opmaakLijn(reeks.data[actief] ?? 0),
                color: chartColor(bars.length + index, reeks.color),
              })),
            ]}
          />
        )}
      </div>

      {legend && (
        <ChartLegend
          items={[
            ...bars.map((reeks, index) => ({ label: reeks.name, color: chartColor(index, reeks.color) })),
            ...lines.map((reeks, index) => ({
              label: reeks.name,
              color: chartColor(bars.length + index, reeks.color),
            })),
          ]}
        />
      )}
    </div>
  );
});
