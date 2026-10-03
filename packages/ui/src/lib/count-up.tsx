"use client";
import * as React from "react";

/**
 * Laat een getal optellen van 0 (of de vorige waarde) naar `target` zodra het
 * element in beeld komt. Respecteert prefers-reduced-motion: dan staat de
 * eindwaarde er meteen.
 */
export function useCountUp(
  target: number,
  options: { duration?: number; ref?: React.RefObject<Element | null>; enabled?: boolean } = {}
): number {
  const { duration = 900, ref, enabled = true } = options;
  const [waarde, setWaarde] = React.useState(enabled ? 0 : target);
  const vorige = React.useRef(0);
  const [inBeeld, setInBeeld] = React.useState(!ref);

  React.useEffect(() => {
    if (!ref?.current || inBeeld) return;
    if (typeof IntersectionObserver === "undefined") {
      setInBeeld(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInBeeld(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, inBeeld]);

  React.useEffect(() => {
    if (!enabled || !inBeeld) return;
    const rustig =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (rustig || !Number.isFinite(target)) {
      vorige.current = target;
      setWaarde(target);
      return;
    }
    const van = vorige.current;
    const start = performance.now();
    let frame = 0;
    const stap = (nu: number) => {
      const t = Math.min(1, (nu - start) / duration);
      // easeOutExpo: snel vertrekken, zacht landen.
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setWaarde(van + (target - van) * e);
      if (t < 1) frame = requestAnimationFrame(stap);
      else vorige.current = target;
    };
    frame = requestAnimationFrame(stap);
    return () => {
      cancelAnimationFrame(frame);
      vorige.current = target;
    };
  }, [target, duration, enabled, inBeeld]);

  return enabled ? waarde : target;
}

interface Ontleed {
  voor: string;
  getal: number;
  na: string;
  decimalen: number;
  duizend: string;
  komma: string;
}

/** Haalt het eerste getal uit een tekst als "€ 12.480" of "98,4%" en onthoudt de opmaak. */
export function parseNumberText(tekst: string): Ontleed | null {
  const match = tekst.match(/\d+(?:[.,   ]\d+)*/);
  if (!match || match.index === undefined) return null;
  const ruw = match[0];
  const voor = tekst.slice(0, match.index);
  const na = tekst.slice(match.index + ruw.length);
  const minteken = /[-−]\s*$/.test(voor);

  const scheiders = ruw.match(/[.,   ]/g) ?? [];
  let komma = "";
  let duizend = "";
  if (scheiders.length > 0) {
    const laatste = scheiders[scheiders.length - 1] ?? "";
    const naLaatste = ruw.slice(ruw.lastIndexOf(laatste) + 1);
    const soorten = new Set(scheiders);
    if (soorten.size > 1) {
      komma = laatste;
      duizend = scheiders[0] ?? "";
    } else if (scheiders.length === 1 && naLaatste.length !== 3 && (laatste === "." || laatste === ",")) {
      komma = laatste;
    } else {
      duizend = laatste;
    }
  }
  const [heel, deel = ""] = komma ? [ruw.slice(0, ruw.lastIndexOf(komma)), ruw.slice(ruw.lastIndexOf(komma) + 1)] : [ruw, ""];
  const cijfers = heel.replace(/[^\d]/g, "");
  const getal = Number(`${cijfers}.${deel || "0"}`);
  if (!Number.isFinite(getal)) return null;
  return {
    voor: minteken ? voor.replace(/[-−]\s*$/, "") : voor,
    getal: minteken ? -getal : getal,
    na,
    decimalen: deel.length,
    duizend,
    komma: komma || ",",
  };
}

function schrijf(getal: number, o: Ontleed): string {
  const negatief = getal < 0;
  const [heel, deel] = Math.abs(getal).toFixed(o.decimalen).split(".");
  const metGroepen = o.duizend ? heel.replace(/\B(?=(\d{3})+(?!\d))/g, o.duizend) : heel;
  return `${o.voor}${negatief ? "−" : ""}${metGroepen}${deel ? o.komma + deel : ""}${o.na}`;
}

export interface CountUpProps {
  /** Getal of tekst met een getal erin; andere inhoud wordt gewoon getoond. */
  value: React.ReactNode;
  duration?: number;
  /** Zet op false om meteen de eindwaarde te tonen. */
  enabled?: boolean;
  className?: string;
}

/** CountUp — telt het getal in `value` op wanneer het in beeld komt, met behoud van opmaak. */
export function CountUp({ value, duration, enabled = true, className }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const ontleed = React.useMemo(() => {
    if (typeof value === "number") {
      const tekst = String(value);
      const decimalen = tekst.includes(".") ? tekst.split(".")[1].length : 0;
      return { voor: "", getal: value, na: "", decimalen, duizend: "", komma: "." } satisfies Ontleed;
    }
    return typeof value === "string" ? parseNumberText(value) : null;
  }, [value]);

  const huidig = useCountUp(ontleed?.getal ?? 0, { duration, ref, enabled: enabled && ontleed !== null });

  if (!ontleed) return <>{value}</>;
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {/* Screenreaders krijgen meteen de echte waarde. */}
      <span aria-hidden="true">{schrijf(huidig, ontleed)}</span>
      <span className="lui-sr-only">{typeof value === "number" ? String(value) : value}</span>
    </span>
  );
}
