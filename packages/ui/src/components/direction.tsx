"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export type Direction = "ltr" | "rtl";

const DirectionContext = React.createContext<Direction>("ltr");

/** Geeft de leesrichting van de dichtstbijzijnde DirectionProvider terug. */
export function useDirection(): Direction {
  return React.useContext(DirectionContext);
}

/** True bij rechts-naar-links; handig om een pijltje of berekening te spiegelen. */
export function useIsRtl(): boolean {
  return useDirection() === "rtl";
}

export interface DirectionProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  dir?: Direction;
  /** Alleen de context zetten, zonder een extra element eromheen. */
  asChild?: boolean;
  /** Ook het dir-attribuut op <html> zetten, voor overlays in een Portal. */
  applyToDocument?: boolean;
}

/**
 * DirectionProvider — zet de leesrichting voor alles eronder. De componenten
 * zelf gebruiken logische CSS-eigenschappen (inset-inline, margin-inline), dus
 * ze spiegelen mee zodra `dir` omgaat.
 */
export const DirectionProvider = React.forwardRef<HTMLDivElement, DirectionProviderProps>(
  function DirectionProvider({ dir = "ltr", asChild, applyToDocument, className, children, ...rest }, ref) {
    React.useEffect(() => {
      if (!applyToDocument) return;
      const vorige = document.documentElement.dir;
      document.documentElement.dir = dir;
      return () => {
        document.documentElement.dir = vorige;
      };
    }, [applyToDocument, dir]);

    if (asChild) {
      return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
    }

    return (
      <DirectionContext.Provider value={dir}>
        <div ref={ref} dir={dir} className={cn("lui-dir", className)} {...rest}>
          {children}
        </div>
      </DirectionContext.Provider>
    );
  }
);
