"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";

export interface NumberFlowProps
  extends Omit<
    React.HTMLAttributes<HTMLSpanElement>,
    "children" | "prefix" | "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  value: number;
  /** Opmaak van het getal, bv. { style: "currency", currency: "EUR" }. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  /** Vaste tekst voor en na het getal. */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Duur van de overgang in seconden. */
  duration?: number;
  /** Elk cijfer rolt op zijn plaats; uit telt het hele getal op. */
  roll?: boolean;
  /** Groen bij stijgen en rood bij dalen. */
  colorize?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * NumberFlow — getal dat naar zijn nieuwe waarde rolt in plaats van te
 * verspringen. Elk cijfer schuift apart, dus alleen wat verandert beweegt.
 */
export const NumberFlow = React.forwardRef<HTMLSpanElement, NumberFlowProps>(function NumberFlow(
  {
    value,
    format,
    locale = "nl-BE",
    prefix,
    suffix,
    duration = 0.5,
    roll = true,
    colorize,
    size = "md",
    className,
    ...rest
  },
  ref
) {
  const rustig = useReducedMotion();
  const vorige = React.useRef(value);
  const richting = value > vorige.current ? 1 : value < vorige.current ? -1 : 0;
  React.useEffect(() => {
    vorige.current = value;
  }, [value]);

  const tekst = React.useMemo(
    () => new Intl.NumberFormat(locale, format).format(value),
    [value, locale, format]
  );

  /* Zonder rol tellen we de waarde zelf op, zodat lange getallen rustig blijven. */
  const [getoond, setGetoond] = React.useState(value);
  React.useEffect(() => {
    if (roll || rustig) {
      setGetoond(value);
      return;
    }
    const van = getoond;
    const start = performance.now();
    let frame = requestAnimationFrame(function stap(nu) {
      const deel = Math.min((nu - start) / (duration * 1000), 1);
      /* easeOutCubic: snel starten, zacht landen. */
      const soepel = 1 - Math.pow(1 - deel, 3);
      setGetoond(van + (value - van) * soepel);
      if (deel < 1) frame = requestAnimationFrame(stap);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, roll, rustig, duration]);

  const tellend = React.useMemo(
    () => new Intl.NumberFormat(locale, format).format(roll ? value : getoond),
    [getoond, value, roll, locale, format]
  );

  const klassen = cn(
    "lui-numberflow",
    `lui-numberflow-${size}`,
    colorize && richting > 0 && "lui-numberflow-up",
    colorize && richting < 0 && "lui-numberflow-down",
    className
  );

  if (!roll || rustig) {
    return (
      <span ref={ref} className={klassen} {...rest}>
        {prefix}
        <span className="lui-numberflow-static">{tellend}</span>
        {suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={klassen} aria-label={tekst} {...rest}>
      {prefix}
      <span className="lui-numberflow-digits" aria-hidden="true">
        {tekst.split("").map((teken, index) => {
          const isCijfer = /\d/.test(teken);
          if (!isCijfer) {
            return (
              <span className="lui-numberflow-sep" key={`${index}-${teken}`}>
                {teken}
              </span>
            );
          }
          return (
            <span className="lui-numberflow-slot" key={index}>
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={teken}
                  className="lui-numberflow-digit"
                  initial={{ y: `${richting >= 0 ? 100 : -100}%`, opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: `${richting >= 0 ? -100 : 100}%`, opacity: 0, position: "absolute" }}
                  transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
                >
                  {teken}
                </motion.span>
              </AnimatePresence>
            </span>
          );
        })}
      </span>
      {suffix}
    </span>
  );
});
