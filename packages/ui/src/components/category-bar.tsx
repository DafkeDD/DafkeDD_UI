"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { chartColor, formatCompact } from "../lib/chart-utils";

export interface CategoryBarSegment {
  /** Grootte van het segment; wordt omgerekend naar een percentage. */
  value: number;
  label?: React.ReactNode;
  color?: string;
}

export interface CategoryBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Segmenten als getallen of als objecten met label en kleur. */
  data: Array<CategoryBarSegment | number>;
  /** Wijzer op een waarde binnen het totaal. */
  marker?: number;
  markerLabel?: React.ReactNode;
  /** Schaalverdeling onder de balk. */
  showScale?: boolean;
  /** Labels boven de balk met hun aandeel. */
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
  formatValue?: (value: number) => string;
  /** Totaal waartegen gerekend wordt; standaard de som van de segmenten. */
  total?: number;
}

/**
 * CategoryBar — één balk die in gekleurde stukken is verdeeld, met een
 * optionele wijzer. Handig voor budgetten, statusverdelingen en drempels.
 */
export const CategoryBar = React.forwardRef<HTMLDivElement, CategoryBarProps>(function CategoryBar(
  {
    data,
    marker,
    markerLabel,
    showScale,
    showLabels,
    size = "md",
    formatValue,
    total,
    className,
    ...rest
  },
  ref
) {
  const segmenten: CategoryBarSegment[] = data.map((item) =>
    typeof item === "number" ? { value: item } : item
  );
  const som = total ?? segmenten.reduce((totaal, segment) => totaal + segment.value, 0);
  const noemer = som || 1;
  const opmaak = (waarde: number) => (formatValue ? formatValue(waarde) : formatCompact(waarde));

  return (
    <div ref={ref} className={cn("lui-catbar", `lui-catbar-${size}`, className)} {...rest}>
      {showLabels && (
        <div className="lui-catbar-labels">
          {segmenten.map((segment, index) => (
            <span
              key={index}
              className="lui-catbar-label"
              style={{ width: `${(segment.value / noemer) * 100}%` }}
            >
              <span className="lui-catbar-dot" style={{ background: segment.color ?? chartColor(index) }} />
              <span className="lui-catbar-label-text">{segment.label ?? opmaak(segment.value)}</span>
            </span>
          ))}
        </div>
      )}

      <div className="lui-catbar-track">
        {segmenten.map((segment, index) => (
          <span
            key={index}
            className="lui-catbar-segment"
            style={{
              width: `${(segment.value / noemer) * 100}%`,
              background: segment.color ?? chartColor(index),
            }}
            title={segment.label ? undefined : opmaak(segment.value)}
          />
        ))}
        {marker !== undefined && (
          <span
            className="lui-catbar-marker"
            style={{ insetInlineStart: `${Math.min(Math.max(marker / noemer, 0), 1) * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      {marker !== undefined && markerLabel ? (
        <div className="lui-catbar-foot">
          <span
            className="lui-catbar-marker-label"
            style={{ insetInlineStart: `${Math.min(Math.max(marker / noemer, 0), 1) * 100}%` }}
          >
            {markerLabel}
          </span>
        </div>
      ) : null}

      {showScale && (
        <div className="lui-catbar-scale">
          <span>0</span>
          <span>{opmaak(noemer / 2)}</span>
          <span>{opmaak(noemer)}</span>
        </div>
      )}
    </div>
  );
});
