"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface RelativeTimeProps
  extends Omit<React.TimeHTMLAttributes<HTMLTimeElement>, "dateTime" | "style"> {
  /** Het moment zelf: Date, ISO-string of timestamp. */
  value: Date | string | number;
  /** Waartegen gerekend wordt; standaard nu. */
  now?: Date | number;
  locale?: string;
  /** "long" geeft "3 minuten geleden", "narrow" geeft "3 min. geleden". */
  format?: "long" | "short" | "narrow";
  /** Eigen inline stijl; los benoemd omdat `format` de plaats van style inneemt. */
  style?: React.CSSProperties;
  /** Vanaf hoeveel dagen verschil de datum zelf getoond wordt. */
  thresholdDays?: number;
  /** Opmaak van die absolute datum. */
  dateFormat?: Intl.DateTimeFormatOptions;
  /** Zelf bijwerken zolang het verschil klein is. */
  live?: boolean;
  /** Volledige datum in de tooltip. */
  showTitle?: boolean;
  /** Eigen tekst voor "nu". */
  nowLabel?: string;
}

const EENHEDEN: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** Kiest de grootste eenheid die past en rondt af naar nul toe. */
export function relativeParts(seconden: number): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const absoluut = Math.abs(seconden);
  for (const [eenheid, lengte] of EENHEDEN) {
    if (absoluut >= lengte) {
      const aantal = Math.trunc(seconden / lengte);
      return { value: aantal, unit: eenheid };
    }
  }
  return { value: 0, unit: "second" };
}

/** Hoe vaak er bijgewerkt moet worden, in milliseconden. */
function tikInterval(seconden: number): number | null {
  const absoluut = Math.abs(seconden);
  if (absoluut < 60) return 1000;
  if (absoluut < 3600) return 60000;
  if (absoluut < 86400) return 600000;
  return null;
}

/**
 * RelativeTime — "3 minuten geleden", en vanaf een paar dagen gewoon de datum.
 * Rendert een echt <time>-element met het ISO-moment erin, en werkt zichzelf
 * bij zolang dat zinvol is.
 */
export const RelativeTime = React.forwardRef<HTMLTimeElement, RelativeTimeProps>(
  function RelativeTime(
    {
      value,
      now,
      locale = "nl-BE",
      format = "long",
      thresholdDays = 7,
      dateFormat = { day: "numeric", month: "long", year: "numeric" },
      live = true,
      showTitle = true,
      nowLabel = "net nu",
      className,
      ...rest
    },
    ref
  ) {
    const moment = React.useMemo(() => new Date(value), [value]);
    const [tik, setTik] = React.useState(0);

    const referentie = now ? new Date(now).getTime() : Date.now();
    const verschil = Math.round((moment.getTime() - referentie) / 1000);

    React.useEffect(() => {
      if (!live || now) return;
      const wacht = tikInterval(verschil);
      if (wacht === null) return;
      const timer = window.setTimeout(() => setTik((n) => n + 1), wacht);
      return () => window.clearTimeout(timer);
    }, [live, now, verschil, tik]);

    const geldig = !Number.isNaN(moment.getTime());

    const tekst = React.useMemo(() => {
      if (!geldig) return "";
      const dagen = Math.abs(verschil) / 86400;
      if (dagen >= thresholdDays) {
        return new Intl.DateTimeFormat(locale, dateFormat).format(moment);
      }
      if (Math.abs(verschil) < 10) return nowLabel;
      const { value: aantal, unit } = relativeParts(verschil);
      return new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: format }).format(aantal, unit);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verschil, geldig, thresholdDays, locale, format, nowLabel, moment, dateFormat]);

    const volledig = React.useMemo(
      () =>
        geldig
          ? new Intl.DateTimeFormat(locale, {
              dateStyle: "full",
              timeStyle: "short",
            }).format(moment)
          : undefined,
      [geldig, locale, moment]
    );

    if (!geldig) return null;

    return (
      <time
        ref={ref}
        dateTime={moment.toISOString()}
        title={showTitle ? volledig : undefined}
        className={cn("lui-reltime", className)}
        /* Server en client kunnen een seconde verschillen; pas na het monteren
           telt de tijd echt mee voor de hydratatie. */
        suppressHydrationWarning
        {...rest}
      >
        {tekst}
      </time>
    );
  }
);
