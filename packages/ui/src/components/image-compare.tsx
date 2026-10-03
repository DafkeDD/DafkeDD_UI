"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

export interface ImageCompareProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Afbeelding links of onder de schuif. */
  before: string;
  /** Afbeelding rechts of boven de schuif. */
  after: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** Labeltjes in de hoeken. */
  beforeLabel?: React.ReactNode;
  afterLabel?: React.ReactNode;
  /** Positie van de schuif, 0 tot 100. */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Verticaal vergelijken in plaats van horizontaal. */
  vertical?: boolean;
  /** Verhouding van het kader, bv. 16 / 9. */
  aspectRatio?: number;
  /** Meeschuiven zodra de muis over de afbeelding gaat, zonder klikken. */
  hoverToMove?: boolean;
}

/**
 * ImageCompare — twee afbeeldingen over elkaar met een schuif ertussen.
 * De schuif is een echte slider: pijltjes verplaatsen hem, Home en End
 * springen naar de uiteinden.
 */
export const ImageCompare = React.forwardRef<HTMLDivElement, ImageCompareProps>(function ImageCompare(
  {
    before,
    after,
    beforeAlt = "",
    afterAlt = "",
    beforeLabel,
    afterLabel,
    value,
    defaultValue = 50,
    onValueChange,
    vertical,
    aspectRatio = 16 / 9,
    hoverToMove,
    className,
    ...rest
  },
  ref
) {
  const [positie, setPositie] = useControllableState<number>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const kader = React.useRef<HTMLDivElement>(null);
  const sleept = React.useRef(false);

  const meet = (clientX: number, clientY: number) => {
    const el = kader.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const deel = vertical
      ? (clientY - rect.top) / rect.height
      : (clientX - rect.left) / rect.width;
    setPositie(Math.min(Math.max(deel * 100, 0), 100));
  };

  const opToets = (event: React.KeyboardEvent) => {
    const stap = event.shiftKey ? 10 : 2;
    const acties: Record<string, number | "min" | "max"> = {
      ArrowRight: stap,
      ArrowUp: stap,
      ArrowLeft: -stap,
      ArrowDown: -stap,
      Home: "min",
      End: "max",
    };
    const actie = acties[event.key];
    if (actie === undefined) return;
    event.preventDefault();
    if (actie === "min") setPositie(0);
    else if (actie === "max") setPositie(100);
    else setPositie(Math.min(Math.max(positie + actie, 0), 100));
  };

  const richting = vertical ? "inset-block-start" : "inset-inline-start";

  return (
    <div
      ref={ref}
      className={cn("lui-compare", vertical && "lui-compare-vertical", className)}
      {...rest}
    >
      <div
        ref={kader}
        className="lui-compare-frame"
        style={{ aspectRatio: String(aspectRatio) }}
        onPointerDown={(event) => {
          sleept.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          meet(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (sleept.current || hoverToMove) meet(event.clientX, event.clientY);
        }}
        onPointerUp={() => (sleept.current = false)}
        onPointerCancel={() => (sleept.current = false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={before} alt={beforeAlt} className="lui-compare-img" draggable={false} />

        <div
          className="lui-compare-clip"
          style={{
            clipPath: vertical
              ? `inset(${positie}% 0 0 0)`
              : `inset(0 0 0 ${positie}%)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={after} alt={afterAlt} className="lui-compare-img" draggable={false} />
        </div>

        {beforeLabel && <span className="lui-compare-label" data-side="before">{beforeLabel}</span>}
        {afterLabel && <span className="lui-compare-label" data-side="after">{afterLabel}</span>}

        <div className="lui-compare-line" style={{ [richting]: `${positie}%` } as React.CSSProperties}>
          <button
            type="button"
            className="lui-compare-handle"
            role="slider"
            aria-label="Vergelijken"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(positie)}
            aria-orientation={vertical ? "vertical" : "horizontal"}
            onKeyDown={opToets}
          >
            <span className="lui-compare-grip" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
});
