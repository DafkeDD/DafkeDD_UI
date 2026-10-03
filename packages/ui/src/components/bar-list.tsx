"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { chartColor, formatCompact } from "../lib/chart-utils";

export interface BarListItem {
  label: string;
  value: number;
  /** Maakt de rij klikbaar als link. */
  href?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface BarListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: BarListItem[];
  /** Hoogste waarde eerst. */
  sorted?: boolean;
  /** Alleen de eerste n rijen tonen. */
  limit?: number;
  /** Eigen maximum voor de balkbreedte; standaard de hoogste waarde. */
  max?: number;
  formatValue?: (value: number) => string;
  /** Eén kleur voor alle balken in plaats van het palet. */
  color?: string;
  /** Kleur per rij uit het palet in plaats van één kleur. */
  multicolor?: boolean;
  size?: "sm" | "md";
  onSelect?: (item: BarListItem, index: number) => void;
  emptyLabel?: React.ReactNode;
}

/**
 * BarList — rangschikking als horizontale balken met het label erin.
 * De klassieke "top 10": pagina's, bronnen, landen, foutmeldingen.
 */
export const BarList = React.forwardRef<HTMLDivElement, BarListProps>(function BarList(
  {
    data,
    sorted = true,
    limit,
    max,
    formatValue,
    color = "var(--chart-1)",
    multicolor,
    size = "md",
    onSelect,
    emptyLabel = "Geen gegevens",
    className,
    ...rest
  },
  ref
) {
  const rijen = React.useMemo(() => {
    const kopie = sorted ? [...data].sort((a, b) => b.value - a.value) : data;
    return limit ? kopie.slice(0, limit) : kopie;
  }, [data, sorted, limit]);

  const hoogste = max ?? Math.max(...rijen.map((rij) => rij.value), 1);
  const opmaak = (waarde: number) => (formatValue ? formatValue(waarde) : formatCompact(waarde));

  if (rijen.length === 0) {
    return (
      <div ref={ref} className={cn("lui-barlist", className)} {...rest}>
        <div className="lui-chart-empty">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("lui-barlist", `lui-barlist-${size}`, className)} {...rest}>
      {rijen.map((rij, index) => {
        const breedte = `${Math.max((rij.value / hoogste) * 100, 1.5)}%`;
        const kleur = rij.color ?? (multicolor ? chartColor(index) : color);
        const klikbaar = Boolean(rij.href || onSelect);

        const inhoud = (
          <>
            <span className="lui-barlist-fill" style={{ width: breedte, background: kleur }} aria-hidden="true" />
            <span className="lui-barlist-label">
              {rij.icon}
              {rij.label}
            </span>
          </>
        );

        return (
          <div className="lui-barlist-row" key={`${rij.label}-${index}`} style={{ "--i": index } as React.CSSProperties}>
            {rij.href ? (
              <a className="lui-barlist-track" href={rij.href}>
                {inhoud}
              </a>
            ) : klikbaar ? (
              <button type="button" className="lui-barlist-track" onClick={() => onSelect?.(rij, index)}>
                {inhoud}
              </button>
            ) : (
              <div className="lui-barlist-track">{inhoud}</div>
            )}
            <span className="lui-barlist-value">{opmaak(rij.value)}</span>
          </div>
        );
      })}
    </div>
  );
});
