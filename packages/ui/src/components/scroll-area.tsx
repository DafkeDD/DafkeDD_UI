"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Welke richting mag scrollen. */
  orientation?: "vertical" | "horizontal" | "both";
  /** Vaste hoogte; zonder dit bepaalt de ouder de hoogte. */
  height?: number | string;
  maxHeight?: number | string;
  /** Vervaging aan de randen zolang er meer inhoud is (standaard aan). */
  fade?: boolean;
  /** Balk blijft altijd zichtbaar in plaats van alleen bij hoveren. */
  alwaysVisible?: boolean;
}

/**
 * ScrollArea — scrollbaar vlak met een smalle, ingetogen scrollbalk en
 * vervaging aan de randen zolang er meer inhoud is.
 *
 * De balk is de echte scrollbalk van de browser, alleen anders opgemaakt:
 * zo blijven vegen, scrollwiel en toetsenbord werken zoals gebruikers verwachten.
 */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { orientation = "vertical", height, maxHeight, fade = true, alwaysVisible, className, children, style, onScroll, ...rest },
  ref
) {
  const eigen = React.useRef<HTMLDivElement | null>(null);
  const [randen, setRanden] = React.useState({ boven: false, onder: false, links: false, rechts: false });

  const meet = React.useCallback(() => {
    const node = eigen.current;
    if (!node || !fade) return;
    const speling = 2;
    setRanden({
      boven: node.scrollTop > speling,
      onder: node.scrollTop + node.clientHeight < node.scrollHeight - speling,
      links: node.scrollLeft > speling,
      rechts: node.scrollLeft + node.clientWidth < node.scrollWidth - speling,
    });
  }, [fade]);

  React.useEffect(() => {
    meet();
    const node = eigen.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(meet);
    observer.observe(node);
    for (const kind of Array.from(node.children)) observer.observe(kind);
    return () => observer.disconnect();
  }, [meet, children]);

  return (
    <div
      ref={(node) => {
        eigen.current = node;
        if (typeof ref === "function") ref(node as HTMLDivElement);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn("lui-scroll-area", `lui-scroll-${orientation}`, alwaysVisible && "lui-scroll-visible", className)}
      style={{ height, maxHeight, ...style }}
      data-fade-top={fade && randen.boven ? "" : undefined}
      data-fade-bottom={fade && randen.onder ? "" : undefined}
      data-fade-left={fade && randen.links ? "" : undefined}
      data-fade-right={fade && randen.rechts ? "" : undefined}
      onScroll={(event) => {
        onScroll?.(event);
        meet();
      }}
      {...rest}
    >
      {children}
    </div>
  );
});
