"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconden voor één volledige ronde; hoger is trager. */
  duration?: number;
  /** De andere kant op. */
  reverse?: boolean;
  /** Van onder naar boven in plaats van zijwaarts. */
  vertical?: boolean;
  /** Stilstaan zolang de muis erboven hangt. */
  pauseOnHover?: boolean;
  /** Ruimte tussen de kinderen. */
  gap?: number;
  /** Zachte rand links en rechts, zodat de inhoud niet hard afgesneden lijkt. */
  fade?: boolean;
  /** Hoe vaak de rij herhaald wordt; meer bij weinig inhoud. */
  repeat?: number;
}

/**
 * Marquee — rij die eindeloos doorloopt. Pure CSS, dus geen dependency en
 * geen JavaScript per frame. De inhoud wordt herhaald, zodat de lus naadloos is.
 */
export const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(function Marquee(
  {
    duration = 28,
    reverse,
    vertical,
    pauseOnHover = true,
    gap = 20,
    fade,
    repeat = 2,
    className,
    children,
    style,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "lui-marquee",
        vertical && "lui-marquee-vertical",
        fade && "lui-marquee-fade",
        pauseOnHover && "lui-marquee-pausable",
        className
      )}
      style={{
        ...style,
        ["--lui-marquee-duration" as string]: `${duration}s`,
        ["--lui-marquee-gap" as string]: `${gap}px`,
        ["--lui-marquee-direction" as string]: reverse ? "reverse" : "normal",
      }}
      {...rest}
    >
      {Array.from({ length: Math.max(repeat, 2) }, (_, index) => (
        <div className="lui-marquee-row" key={index} aria-hidden={index > 0 ? "true" : undefined}>
          {children}
        </div>
      ))}
    </div>
  );
});
