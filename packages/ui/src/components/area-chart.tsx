"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import {
  ChartAxisX,
  ChartAxisY,
  ChartGrid,
  ChartTooltip,
  areaPath,
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

export interface AreaChartProps extends React.HTMLAttributes<HTMLDivElement> {
  series: ChartSeries[];
  /** Eén label per punt; bepaalt de x-as. */
  labels?: string[];
  height?: number;
  /** Reeksen op elkaar stapelen in plaats van over elkaar leggen. */
  stacked?: boolean;
  /** Zachte lijn in plaats van rechte segmenten. */
  curved?: boolean;
  grid?: boolean;
  /** Waardes langs de verticale as tonen. */
  axis?: boolean;
  /** Gewenst aantal stappen op de verticale as. */
  yTicks?: number;
  /** De as laten beginnen bij nul, ook als de data hoger ligt. */
  startAtZero?: boolean;
  legend?: boolean;
  tooltip?: boolean;
  formatValue?: (value: number) => string;
  /** Hoogstens zoveel labels onder de as; de rest valt weg. */
  maxLabels?: number;
  emptyLabel?: React.ReactNode;
}

/**
 * AreaChart — gevuld vlak per reeks, met assen, hulplijnen en een tooltip die
 * alle reeksen op dezelfde x toont. Met `stacked` tellen de reeksen op.
 */
export const AreaChart = React.forwardRef<HTMLDivElement, AreaChartProps>(function AreaChart(
  {
    series,
    labels,
    height = 220,
    stacked,
    curved = true,
    grid = true,
    axis = true,
    yTicks = 5,
    startAtZero = true,
    legend = true,
    tooltip = true,
    formatValue,
    maxLabels = 8,
    emptyLabel = "Geen gegevens",
    className,
    ...rest
  },
  ref
) {
  const vlak = React.useRef<HTMLDivElement>(null);
  const breedte = useChartWidth(vlak);

  const aantal = Math.max(...series.map((reeks) => reeks.data.length), 0);
  const leeg = series.length === 0 || aantal === 0;

  const opmaak = React.useCallback(
    (waarde: number) => (formatValue ? formatValue(waarde) : formatCompact(waarde)),
    [formatValue]
  );

  /* Bij stapelen telt de bovenste reeks het totaal, dus de as moet daarop passen. */
  const gestapeld = React.useMemo(() => {
    if (!stacked) return null;
    const lagen: number[][] = [];
    const lopend = new Array(aantal).fill(0);
    for (const reeks of series) {
      const laag: number[] = [];
      for (let i = 0; i < aantal; i += 1) {
        lopend[i] += reeks.data[i] ?? 0;
        laag.push(lopend[i]);
      }
      lagen.push(laag);
    }
    return lagen;
  }, [series, stacked, aantal]);

  const alles = gestapeld ? gestapeld.flat() : series.flatMap((reeks) => reeks.data);
  const schaal = niceScale(
    startAtZero ? Math.min(0, ...alles) : Math.min(...alles),
    Math.max(...alles, 0),
    yTicks
  );

  const marge = {
    top: 10,
    right: 10,
    bottom: labels ? 24 : 6,
    left: axis ? 46 : 6,
  };
  const binnenBreedte = Math.max(breedte - marge.left - marge.right, 10);
  const binnenHoogte = Math.max(height - marge.top - marge.bottom, 10);

  const stap = aantal > 1 ? binnenBreedte / (aantal - 1) : 0;
  const toX = (index: number) => marge.left + (aantal > 1 ? index * stap : binnenBreedte / 2);
  const toY = (waarde: number) =>
    marge.top + binnenHoogte - ((waarde - schaal.min) / (schaal.max - schaal.min || 1)) * binnenHoogte;

  const hover = useChartHover(aantal, marge.left, stap);
  const actief = tooltip ? hover.index : null;

  if (leeg) {
    return (
      <div ref={ref} className={cn("lui-chart", className)} {...rest}>
        <div className="lui-chart-empty">{emptyLabel}</div>
      </div>
    );
  }

  const nullijn = toY(Math.max(schaal.min, 0));

  return (
    <div ref={ref} className={cn("lui-chart", className)} {...rest}>
      <div className="lui-chart-plot" ref={vlak} style={{ height }}>
        <svg
          width={breedte}
          height={height}
          viewBox={`0 0 ${breedte} ${height}`}
          role="img"
          aria-label={`Vlakgrafiek met ${series.length} reeks${series.length === 1 ? "" : "en"}`}
          onPointerMove={tooltip ? hover.onPointerMove : undefined}
          onPointerLeave={tooltip ? hover.onPointerLeave : undefined}
        >
          {grid && <ChartGrid ticks={schaal.ticks} toY={toY} x1={marge.left} x2={breedte - marge.right} />}
          {axis && <ChartAxisY ticks={schaal.ticks} toY={toY} x={marge.left - 10} format={opmaak} />}

          {series.map((reeks, index) => {
            const waarden = gestapeld ? gestapeld[index] : reeks.data;
            const punten: ChartPoint[] = waarden.map((waarde, i) => ({ x: toX(i), y: toY(waarde) }));
            const onder: ChartPoint[] =
              gestapeld && index > 0
                ? gestapeld[index - 1].map((waarde, i) => ({ x: toX(i), y: toY(waarde) }))
                : [];
            const kleur = chartColor(index, reeks.color);

            /* Gestapeld loopt het vlak tot de reeks eronder, niet tot de nullijn. */
            const vulling =
              onder.length > 0
                ? `${linePath(punten, curved)} ${linePath([...onder].reverse(), curved).replace(/^M/, "L")} Z`
                : areaPath(punten, nullijn, curved);

            return (
              <g key={reeks.name} style={{ "--i": index } as React.CSSProperties}>
                <path d={vulling} fill={kleur} className="lui-chart-area" />
                <path
                  d={linePath(punten, curved)}
                  stroke={kleur}
                  pathLength={1}
                  className="lui-chart-line lui-chart-draw"
                />
              </g>
            );
          })}

          {actief !== null && (
            <g>
              <line
                x1={toX(actief)}
                x2={toX(actief)}
                y1={marge.top}
                y2={marge.top + binnenHoogte}
                className="lui-chart-crosshair"
              />
              {series.map((reeks, index) => {
                const waarde = (gestapeld ? gestapeld[index] : reeks.data)[actief];
                if (waarde === undefined) return null;
                return (
                  <circle
                    key={reeks.name}
                    cx={toX(actief)}
                    cy={toY(waarde)}
                    r={4}
                    fill={chartColor(index, reeks.color)}
                    className="lui-chart-dot"
                  />
                );
              })}
            </g>
          )}

          {labels && <ChartAxisX labels={labels} toX={toX} y={height - 6} maxLabels={maxLabels} />}
        </svg>

        {actief !== null && (
          <ChartTooltip
            x={toX(actief)}
            y={marge.top + binnenHoogte / 2}
            containerWidth={breedte}
            title={labels?.[actief]}
            items={series.map((reeks, index) => ({
              label: reeks.name,
              value: opmaak(reeks.data[actief] ?? 0),
              color: chartColor(index, reeks.color),
            }))}
          />
        )}
      </div>

      {legend && (
        <ChartLegend
          items={series.map((reeks, index) => ({
            label: reeks.name,
            color: chartColor(index, reeks.color),
          }))}
        />
      )}
    </div>
  );
});
