"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Aantal sterren. */
  max?: number;
  /** Halve sterren toestaan, bij het tonen en bij het kiezen. */
  half?: boolean;
  size?: number;
  /** Alleen tonen, niet kiezen. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Tekst rechts van de sterren, bijvoorbeeld "4,2 · 18 beoordelingen". */
  caption?: React.ReactNode;
  label?: string;
}

/** Rating — sterren om iets te beoordelen of een score te tonen. */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(function Rating(
  {
    value,
    defaultValue = 0,
    onValueChange,
    max = 5,
    half,
    size = 18,
    readOnly,
    disabled,
    caption,
    label = "Beoordeling",
    className,
    ...rest
  },
  ref
) {
  const [score, setScore] = useControllableState<number>({ value, defaultValue, onChange: onValueChange });
  const [zweef, setZweef] = React.useState<number | null>(null);
  const vast = readOnly || disabled;
  const getoond = zweef ?? score;

  return (
    <div
      ref={ref}
      role={vast ? "img" : "slider"}
      aria-label={label}
      aria-valuenow={vast ? undefined : score}
      aria-valuemin={vast ? undefined : 0}
      aria-valuemax={vast ? undefined : max}
      aria-valuetext={`${score} van ${max}`}
      tabIndex={vast ? undefined : 0}
      data-readonly={vast ? "" : undefined}
      className={cn("lui-rating", className)}
      onKeyDown={(event) => {
        if (vast) return;
        const stap = half ? 0.5 : 1;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          setScore(Math.min(score + stap, max));
        } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          setScore(Math.max(score - stap, 0));
        }
      }}
      onMouseLeave={() => setZweef(null)}
      {...rest}
    >
      <span className="lui-rating-sterren">
        {Array.from({ length: max }, (_, i) => {
          const ster = i + 1;
          const vulling = Math.min(Math.max(getoond - i, 0), 1);
          return (
            <span
              key={ster}
              className="lui-rating-ster"
              style={{ width: size, height: size }}
              onMouseMove={(event) => {
                if (vast) return;
                const doos = event.currentTarget.getBoundingClientRect();
                const helft = Boolean(half) && event.clientX - doos.left < doos.width / 2;
                setZweef(helft ? ster - 0.5 : ster);
              }}
              onClick={(event) => {
                if (vast) return;
                const doos = event.currentTarget.getBoundingClientRect();
                const helft = Boolean(half) && event.clientX - doos.left < doos.width / 2;
                setScore(helft ? ster - 0.5 : ster);
              }}
            >
              <Icon name="star" size={size} className="lui-rating-leeg" />
              <span className="lui-rating-vol" style={{ width: `${vulling * 100}%` }}>
                <Icon name="star" size={size} />
              </span>
            </span>
          );
        })}
      </span>
      {caption && <span className="lui-rating-caption">{caption}</span>}
    </div>
  );
});
