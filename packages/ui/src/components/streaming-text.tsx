"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface StreamingTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** De volledige tekst; wordt geleidelijk onthuld. */
  text: string;
  /** Tekens per seconde. */
  speed?: number;
  /** Meteen alles tonen, bv. bij een bericht uit de geschiedenis. */
  instant?: boolean;
  /** Knipperend streepje achter de tekst zolang er nog bij komt. */
  cursor?: boolean;
  /** Per woord onthullen in plaats van per teken; rustiger om te lezen. */
  byWord?: boolean;
  /** Aangeroepen zodra alles getoond is. */
  onDone?: () => void;
  /** Rendert een ander element, bv. "p". */
  as?: React.ElementType;
}

/**
 * StreamingText — tekst die binnenkomt terwijl je kijkt. Groeit de `text`
 * aan (zoals bij een stream), dan loopt hij gewoon door; wordt hij vervangen,
 * dan begint hij opnieuw.
 */
export const StreamingText = React.forwardRef<HTMLSpanElement, StreamingTextProps>(
  function StreamingText(
    { text, speed = 90, instant, cursor = true, byWord, onDone, as: Comp = "span", className, ...rest },
    ref
  ) {
    const [aantal, setAantal] = React.useState(instant ? text.length : 0);
    const melden = React.useRef(onDone);
    melden.current = onDone;

    /* Bij een volledig nieuwe tekst opnieuw beginnen; bij aangroeien doorlopen. */
    const vorige = React.useRef(text);
    if (!text.startsWith(vorige.current.slice(0, aantal))) {
      vorige.current = text;
      if (aantal !== 0) setAantal(0);
    }
    vorige.current = text;

    const stukken = React.useMemo(
      () => (byWord ? text.split(/(\s+)/) : Array.from(text)),
      [text, byWord]
    );

    React.useEffect(() => {
      if (instant) {
        setAantal(stukken.length);
        return;
      }
      if (aantal >= stukken.length) {
        melden.current?.();
        return;
      }
      const interval = 1000 / Math.max(speed, 1) / (byWord ? 0.2 : 1);
      const timer = window.setTimeout(() => setAantal((n) => Math.min(n + 1, stukken.length)), interval);
      return () => window.clearTimeout(timer);
    }, [aantal, stukken.length, speed, instant, byWord]);

    const zichtbaar = React.useMemo(() => stukken.slice(0, aantal).join(""), [stukken, aantal]);
    const bezig = aantal < stukken.length;

    return (
      <Comp
        ref={ref}
        className={cn("lui-stream", className)}
        aria-live="polite"
        aria-busy={bezig || undefined}
        {...rest}
      >
        {zichtbaar}
        {cursor && bezig && <span className="lui-stream-caret" aria-hidden="true" />}
      </Comp>
    );
  }
);

export interface ThinkingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Nog bezig: kopje glinstert en de tijd loopt. */
  active?: boolean;
  title?: React.ReactNode;
  /** De redenering zelf; blijft ingeklapt tot je hem opent. */
  children?: React.ReactNode;
  /** Open of dicht van buitenaf sturen. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Aantal seconden dat getoond wordt zodra het klaar is. */
  seconds?: number;
  /** De tijd zelf bijhouden zolang active aanstaat. */
  timer?: boolean;
}

/**
 * Thinking — inklapbaar blok voor het redeneren van een model: een kopje dat
 * glinstert terwijl het bezig is, en daarna hoe lang het duurde.
 */
export const Thinking = React.forwardRef<HTMLDivElement, ThinkingProps>(function Thinking(
  { active, title, children, open, defaultOpen, onOpenChange, seconds, timer = true, className, ...rest },
  ref
) {
  const [intern, setIntern] = React.useState(defaultOpen ?? false);
  const uitgeklapt = open ?? intern;
  const zetOpen = (waarde: boolean) => {
    if (open === undefined) setIntern(waarde);
    onOpenChange?.(waarde);
  };

  const [verlopen, setVerlopen] = React.useState(0);
  React.useEffect(() => {
    if (!active || !timer) return;
    const start = Date.now();
    const tik = window.setInterval(() => setVerlopen(Math.round((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(tik);
  }, [active, timer]);

  const duur = seconds ?? (verlopen || undefined);
  const kop =
    title ??
    (active
      ? `Aan het denken${duur ? ` · ${duur}s` : "…"}`
      : duur
        ? `Nagedacht in ${duur} seconde${duur === 1 ? "" : "n"}`
        : "Redenering");

  return (
    <div
      ref={ref}
      className={cn("lui-thinking", active && "lui-thinking-active", className)}
      data-open={uitgeklapt ? "" : undefined}
      {...rest}
    >
      <button
        type="button"
        className="lui-thinking-head"
        onClick={() => zetOpen(!uitgeklapt)}
        aria-expanded={uitgeklapt}
        disabled={!children}
      >
        <span className="lui-thinking-title">{kop}</span>
        {children && <span className="lui-thinking-chevron" aria-hidden="true" />}
      </button>
      {uitgeklapt && children && <div className="lui-thinking-body">{children}</div>}
    </div>
  );
});
