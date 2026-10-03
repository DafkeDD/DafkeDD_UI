"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Vast aantal kolommen, of per breekpunt: { 0: 1, 640: 2, 1024: 3 }. */
  columns?: number | Record<number, number>;
  gap?: number;
  /**
   * Kinderen over de kolommen verdelen met JavaScript in plaats van met
   * CSS-kolommen. Houdt de leesvolgorde en werkt met interactieve kaarten.
   */
  balanced?: boolean;
}

/** Leest het aantal kolommen bij de huidige breedte uit de breekpunten. */
function kolommenBij(breedte: number, columns: number | Record<number, number>): number {
  if (typeof columns === "number") return Math.max(columns, 1);
  const punten = Object.keys(columns)
    .map(Number)
    .sort((a, b) => a - b);
  let gekozen = columns[punten[0]] ?? 1;
  for (const punt of punten) if (breedte >= punt) gekozen = columns[punt];
  return Math.max(gekozen, 1);
}

/**
 * Masonry — kolommen waarin kaarten van ongelijke hoogte netjes in elkaar
 * schuiven. Standaard via CSS-kolommen; met `balanced` verdeelt het component
 * de kinderen zelf over de kortste kolom, zodat de hoogtes beter kloppen.
 */
export const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(function Masonry(
  { columns = { 0: 1, 640: 2, 1024: 3 }, gap = 16, balanced, className, children, style, ...rest },
  ref
) {
  const eigen = React.useRef<HTMLDivElement>(null);
  const [breedte, setBreedte] = React.useState(1024);

  React.useEffect(() => {
    if (!balanced) return;
    const el = eigen.current;
    if (!el) return;
    const meet = () => setBreedte(el.clientWidth || 1024);
    meet();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", meet);
      return () => window.removeEventListener("resize", meet);
    }
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(el);
    return () => waarnemer.disconnect();
  }, [balanced]);

  const zetRef = (node: HTMLDivElement | null) => {
    eigen.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  if (!balanced) {
    /* CSS-kolommen: de browser breekt zelf af, met één media query per breekpunt
       via een custom property die we hieronder in een stijlblok zetten. */
    const aantal = typeof columns === "number" ? columns : undefined;
    return (
      <div
        ref={zetRef}
        className={cn("lui-masonry", className)}
        data-auto={aantal === undefined ? "" : undefined}
        style={{
          ...style,
          ["--lui-masonry-gap" as string]: `${gap}px`,
          ...(aantal !== undefined ? { ["--lui-masonry-cols" as string]: aantal } : {}),
        }}
        {...rest}
      >
        {React.Children.map(children, (kind) =>
          kind === null || kind === undefined || kind === false ? null : (
            <div className="lui-masonry-item">{kind}</div>
          )
        )}
      </div>
    );
  }

  const aantal = kolommenBij(breedte, columns);
  const kinderen = React.Children.toArray(children);
  const kolomLijsten: React.ReactNode[][] = Array.from({ length: aantal }, () => []);
  kinderen.forEach((kind, index) => kolomLijsten[index % aantal].push(kind));

  return (
    <div
      ref={zetRef}
      className={cn("lui-masonry", "lui-masonry-balanced", className)}
      style={{ ...style, gap }}
      {...rest}
    >
      {kolomLijsten.map((kolom, index) => (
        <div className="lui-masonry-column" key={index} style={{ gap }}>
          {kolom}
        </div>
      ))}
    </div>
  );
});
