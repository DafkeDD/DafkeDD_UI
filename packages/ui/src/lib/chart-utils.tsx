"use client";
import * as React from "react";
import { cn } from "./cn";

/**
 * Gedeelde bouwstenen voor de grafieken: kleuren, schalen, assen, paden en
 * de tooltip. Elke grafiek tekent zelf zijn vorm, maar rekent met dit bestand,
 * zodat assen en tooltips er overal hetzelfde uitzien.
 */

export const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

/** Kleur nummer `index` uit het palet, tenzij de reeks er zelf een meegeeft. */
export function chartColor(index: number, eigen?: string) {
  return eigen ?? CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Eén reeks getallen met een naam; de x-as komt uit `labels` van de grafiek. */
export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartPoint {
  x: number;
  y: number;
}

/* ------------------------------- afmeting ------------------------------- */

/**
 * Meet de breedte van de container, zodat de SVG op ware grootte tekent en
 * tekst en lijnen niet uitgerekt worden. Tijdens SSR geldt `standaard`.
 */
export function useChartWidth(
  ref: React.RefObject<HTMLElement | null>,
  standaard = 560
): number {
  const [breedte, setBreedte] = React.useState(standaard);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const meet = () => setBreedte(Math.max(el.clientWidth, 120));
    meet();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", meet);
      return () => window.removeEventListener("resize", meet);
    }
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(el);
    return () => waarnemer.disconnect();
  }, [ref]);

  return breedte;
}

/* -------------------------------- schaal -------------------------------- */

export interface ChartScale {
  min: number;
  max: number;
  ticks: number[];
}

/**
 * Ronde asgrenzen met leesbare stappen (1, 2, 2.5, 5, 10 …) rond de data.
 */
export function niceScale(min: number, max: number, aantal = 5): ChartScale {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1, ticks: [0, 1] };
  if (min === max) {
    const marge = Math.abs(min) || 1;
    min -= marge;
    max += marge;
  }
  const ruwe = (max - min) / Math.max(aantal, 1);
  const grootte = Math.pow(10, Math.floor(Math.log10(ruwe)));
  const genormaliseerd = ruwe / grootte;
  const factor = genormaliseerd <= 1 ? 1 : genormaliseerd <= 2 ? 2 : genormaliseerd <= 2.5 ? 2.5 : genormaliseerd <= 5 ? 5 : 10;
  const stap = factor * grootte;
  const onder = Math.floor(min / stap) * stap;
  const boven = Math.ceil(max / stap) * stap;

  const ticks: number[] = [];
  /* In stappen tellen stapelt afrondingsfouten op; daarom via een teller. */
  const stappen = Math.round((boven - onder) / stap);
  for (let i = 0; i <= stappen; i += 1) ticks.push(Number((onder + i * stap).toPrecision(12)));

  return { min: onder, max: boven, ticks };
}

/* ------------------------------- opmaak --------------------------------- */

/** Korte notatie: 1,2 k · 3,4 mln · 2,1 mld. */
export function formatCompact(waarde: number, locale = "nl-BE"): string {
  const absoluut = Math.abs(waarde);
  const eenheden: Array<[number, string]> = [
    [1e9, " mld"],
    [1e6, " mln"],
    [1e3, " k"],
  ];
  for (const [drempel, achtervoegsel] of eenheden) {
    if (absoluut >= drempel) {
      const getal = waarde / drempel;
      return (
        getal.toLocaleString(locale, { maximumFractionDigits: Math.abs(getal) < 10 ? 1 : 0 }) +
        achtervoegsel
      );
    }
  }
  return waarde.toLocaleString(locale, { maximumFractionDigits: 2 });
}

/** Standaardopmaak voor asticks en tooltips. */
export function formatChartValue(
  waarde: number,
  opties?: Intl.NumberFormatOptions,
  locale = "nl-BE"
): string {
  if (opties) return waarde.toLocaleString(locale, opties);
  return waarde.toLocaleString(locale, { maximumFractionDigits: 2 });
}

/* --------------------------------- paden -------------------------------- */

const rond = (n: number) => Math.round(n * 100) / 100;

/**
 * Lijn door de punten. Met `curved` een Catmull-Rom-spline die tussen de
 * punten door loopt zonder eroverheen te schieten.
 */
export function linePath(punten: ChartPoint[], curved = false): string {
  if (punten.length === 0) return "";
  if (punten.length === 1) return `M ${rond(punten[0].x)} ${rond(punten[0].y)}`;
  if (!curved) {
    return punten.map((punt, i) => `${i === 0 ? "M" : "L"} ${rond(punt.x)} ${rond(punt.y)}`).join(" ");
  }

  let d = `M ${rond(punten[0].x)} ${rond(punten[0].y)}`;
  for (let i = 0; i < punten.length - 1; i += 1) {
    const p0 = punten[i - 1] ?? punten[i];
    const p1 = punten[i];
    const p2 = punten[i + 1];
    const p3 = punten[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${rond(c1.x)} ${rond(c1.y)}, ${rond(c2.x)} ${rond(c2.y)}, ${rond(p2.x)} ${rond(p2.y)}`;
  }
  return d;
}

/** Hetzelfde pad, maar gesloten tot aan de nullijn, om het vlak te vullen. */
export function areaPath(punten: ChartPoint[], nullijn: number, curved = false): string {
  if (punten.length === 0) return "";
  const lijn = linePath(punten, curved);
  const eerste = punten[0];
  const laatste = punten[punten.length - 1];
  return `${lijn} L ${rond(laatste.x)} ${rond(nullijn)} L ${rond(eerste.x)} ${rond(nullijn)} Z`;
}

/* ------------------------------- onderdelen ------------------------------ */

export interface ChartGridProps {
  ticks: number[];
  /** Zet een tickwaarde om naar een y-coördinaat. */
  toY: (waarde: number) => number;
  x1: number;
  x2: number;
}

/** Horizontale hulplijnen op de tickhoogtes. */
export function ChartGrid({ ticks, toY, x1, x2 }: ChartGridProps) {
  return (
    <g aria-hidden="true">
      {ticks.map((tick) => (
        <line key={tick} x1={x1} x2={x2} y1={toY(tick)} y2={toY(tick)} className="lui-chart-grid" />
      ))}
    </g>
  );
}

export interface ChartAxisYProps {
  ticks: number[];
  toY: (waarde: number) => number;
  x: number;
  format?: (waarde: number) => string;
  /** Labels rechts van de as in plaats van links. */
  right?: boolean;
}

/** Tekstlabels bij de verticale as. */
export function ChartAxisY({ ticks, toY, x, format = formatCompact, right }: ChartAxisYProps) {
  return (
    <g aria-hidden="true">
      {ticks.map((tick) => (
        <text
          key={tick}
          x={x}
          y={toY(tick)}
          dy="0.32em"
          textAnchor={right ? "start" : "end"}
          className="lui-chart-tick"
        >
          {format(tick)}
        </text>
      ))}
    </g>
  );
}

export interface ChartAxisXProps {
  labels: string[];
  /** Zet een index om naar een x-coördinaat. */
  toX: (index: number) => number;
  y: number;
  /** Laat labels weg zodra ze niet meer passen. */
  maxLabels?: number;
}

/** Tekstlabels onder de horizontale as; dunt uit als er te weinig plaats is. */
export function ChartAxisX({ labels, toX, y, maxLabels = 8 }: ChartAxisXProps) {
  const stap = Math.max(1, Math.ceil(labels.length / Math.max(maxLabels, 1)));
  return (
    <g aria-hidden="true">
      {labels.map((label, index) =>
        index % stap === 0 || index === labels.length - 1 ? (
          <text key={`${label}-${index}`} x={toX(index)} y={y} textAnchor="middle" className="lui-chart-tick">
            {label}
          </text>
        ) : null
      )}
    </g>
  );
}

export interface ChartTooltipItem {
  label: React.ReactNode;
  value: React.ReactNode;
  color?: string;
}

export interface ChartTooltipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Positie binnen de grafiekcontainer, in pixels. */
  x: number;
  y: number;
  title?: React.ReactNode;
  items: ChartTooltipItem[];
  /** Breedte van de container, om binnen de rand te blijven. */
  containerWidth?: number;
}

/**
 * Zwevend kaartje bij het punt onder de muis. Hoort in een container met
 * `position: relative` (de klasse lui-chart doet dat).
 */
export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(function ChartTooltip(
  { x, y, title, items, containerWidth, className, style, ...rest },
  ref
) {
  /* Bij de rechterrand klapt het kaartje naar links, anders valt het weg. */
  const naarLinks = containerWidth !== undefined && x > containerWidth - 130;

  return (
    <div
      ref={ref}
      role="tooltip"
      className={cn("lui-chart-tip", className)}
      style={{
        insetInlineStart: x,
        top: y,
        transform: `translate(${naarLinks ? "calc(-100% - 12px)" : "12px"}, -50%)`,
        ...style,
      }}
      {...rest}
    >
      {title !== undefined && <div className="lui-chart-tip-title">{title}</div>}
      {items.map((item, index) => (
        <div className="lui-chart-tip-row" key={index}>
          {item.color && <span className="lui-chart-tip-swatch" style={{ background: item.color }} />}
          <span className="lui-chart-tip-label">{item.label}</span>
          <span className="lui-chart-tip-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
});

/* -------------------------------- hover --------------------------------- */

/**
 * Volgt welke kolom onder de muis staat in een grafiek met vaste stappen.
 * Geeft handlers voor het hele SVG-vlak terug; de grafiek tekent zelf de
 * crosshair en de tooltip.
 */
export function useChartHover(aantal: number, links: number, stap: number) {
  const [index, setIndex] = React.useState<number | null>(null);

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left - links;
      const dichtst = Math.round(x / (stap || 1));
      setIndex(Math.min(Math.max(dichtst, 0), Math.max(aantal - 1, 0)));
    },
    [aantal, links, stap]
  );

  const onPointerLeave = React.useCallback(() => setIndex(null), []);

  return { index, onPointerMove, onPointerLeave, reset: onPointerLeave };
}
