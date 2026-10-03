"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useMounted } from "../lib/hooks";

export interface CountdownProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Moment waarnaar afgeteld wordt. */
  to: Date | string | number;
  /** Toont dagen zolang er meer dan 24 uur over is. */
  showDays?: boolean;
  /** Alleen de cijfers, gescheiden door dubbele punten. */
  compact?: boolean;
  /** Wordt één keer aangeroepen zodra de teller op nul staat. */
  onComplete?: () => void;
  labels?: { days: string; hours: string; minutes: string; seconds: string };
  /**
   * `plain` toont kale cijfers, `cards` zet elk deel in een tegel met een
   * klapanimatie. In beide varianten rolt elk gewijzigd cijfer binnen.
   */
  variant?: "plain" | "cards";
}

const STANDAARD = { days: "dagen", hours: "uur", minutes: "min", seconds: "sec" };

function resterend(doel: number) {
  const verschil = Math.max(doel - Date.now(), 0);
  return {
    d: Math.floor(verschil / 86400000),
    u: Math.floor((verschil / 3600000) % 24),
    m: Math.floor((verschil / 60000) % 60),
    s: Math.floor((verschil / 1000) % 60),
    klaar: verschil === 0,
  };
}

/** Countdown — telt af naar een moment en stopt vanzelf op nul. */
export const Countdown = React.forwardRef<HTMLDivElement, CountdownProps>(function Countdown(
  { to, showDays = true, compact, onComplete, labels = STANDAARD, variant = "plain", className, ...rest },
  ref
) {
  const doel = React.useMemo(() => new Date(to).getTime(), [to]);
  // De server weet niet hoe laat het in de browser is. Tot de eerste render in
  // de browser voorbij is tonen we streepjes; anders verschilt de HTML van de
  // server van die van de client en klaagt React over hydratie.
  const gemonteerd = useMounted();
  const [tijd, setTijd] = React.useState(() => resterend(doel));
  const gemeld = React.useRef(false);

  React.useEffect(() => {
    gemeld.current = false;
    setTijd(resterend(doel));
    const timer = window.setInterval(() => {
      const volgende = resterend(doel);
      setTijd(volgende);
      if (volgende.klaar && !gemeld.current) {
        gemeld.current = true;
        onComplete?.();
        window.clearInterval(timer);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [doel, onComplete]);

  const delen = [
    ...(showDays && (!gemonteerd || tijd.d > 0) ? [{ waarde: tijd.d, label: labels.days }] : []),
    { waarde: tijd.u, label: labels.hours },
    { waarde: tijd.m, label: labels.minutes },
    { waarde: tijd.s, label: labels.seconds },
  ];

  return (
    <div
      ref={ref}
      role="timer"
      data-done={gemonteerd && tijd.klaar ? "" : undefined}
      data-variant={variant}
      className={cn("lui-countdown", compact && "lui-countdown-compact", className)}
      {...rest}
    >
      {delen.map((deel, index) => (
        <React.Fragment key={deel.label}>
          {compact && index > 0 && <span className="lui-countdown-dubbelepunt">:</span>}
          <span className="lui-countdown-deel">
            <span className="lui-countdown-getal">
              {(gemonteerd ? String(deel.waarde).padStart(2, "0") : "--").split("").map((teken, positie, alle) => (
                // De key verandert mee met het cijfer, zodat alleen gewijzigde
                // cijfers opnieuw monteren en hun animatie afspelen.
                <span key={`${alle.length - positie}-${teken}`} className="lui-countdown-cijfer">
                  {teken}
                </span>
              ))}
            </span>
            {!compact && <span className="lui-countdown-label">{deel.label}</span>}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
});
