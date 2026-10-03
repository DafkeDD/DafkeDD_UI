"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export type StepTrackerStatus = "done" | "active" | "pending" | "error";
export type StepTrackerTone = "neutral" | "accent" | "green" | "amber" | "red";

export interface StepTrackerStep {
  id?: string;
  title: React.ReactNode;
  /** Regel onder de titel zodra de stap klaar is, bv. "Magazijn Gent". */
  detail?: React.ReactNode;
  /** Tijdstip rechts, meestal pas ingevuld als de stap klaar is. */
  time?: React.ReactNode;
  /** Klein icoon rechts; wordt ook in de actieve stip getoond. */
  icon?: React.ReactNode;
  /** Forceer een status; anders volgt die uit `current`. */
  status?: StepTrackerStatus;
}

export interface StepTrackerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  steps: StepTrackerStep[];
  /**
   * Index van de stap die nu loopt. Alles ervoor is klaar, alles erna wacht.
   * -1 = nog niets gestart, `steps.length` = alles klaar.
   */
  current?: number;
  /** Probleem op de huidige stap: de stip wordt rood en er kan een actie bij. */
  error?: { message: React.ReactNode; action?: { label: React.ReactNode; onClick: () => void } } | null;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Icoon in het tegeltje links van de titel. */
  icon?: React.ReactNode;
  /** Statuslabel rechtsboven, bv. { label: "Onderweg", tone: "accent" }. */
  status?: { label: React.ReactNode; tone?: StepTrackerTone };
  /** Kleine tekst naast de status, bv. "Verwacht 2 okt". */
  meta?: React.ReactNode;
  /** Links onderaan, bv. een opmerking. */
  footer?: React.ReactNode;
  /** Rechts onderaan, meestal een knop. */
  action?: React.ReactNode;
  labels?: { pending?: React.ReactNode; active?: React.ReactNode };
}

/**
 * StepTracker — live stappentijdlijn voor een bestelling, uitrol of onboarding.
 * Een markering glijdt mee naar de stap die loopt, de lijn vult zich achter
 * elke afgewerkte stap en een probleem krijgt een eigen actie.
 */
export const StepTracker = React.forwardRef<HTMLDivElement, StepTrackerProps>(function StepTracker(
  {
    steps,
    current = 0,
    error,
    title,
    subtitle,
    icon,
    status,
    meta,
    footer,
    action,
    labels,
    className,
    ...rest
  },
  ref
) {
  const lijst = React.useRef<HTMLOListElement>(null);
  const [markering, setMarkering] = React.useState<{ y: number; h: number; klaar: boolean } | null>(null);

  const statusVan = (index: number): StepTrackerStatus => {
    const eigen = steps[index]?.status;
    if (eigen) return eigen;
    if (index < current) return "done";
    if (index === current) return error ? "error" : "active";
    return "pending";
  };

  // De markering meet de lopende stap en glijdt ernaartoe.
  React.useEffect(() => {
    const ol = lijst.current;
    if (!ol) return;
    const meet = () => {
      const rij = ol.querySelector<HTMLElement>('[data-status="active"], [data-status="error"]');
      if (!rij) {
        setMarkering(null);
        return;
      }
      setMarkering((vorig) => ({ y: rij.offsetTop, h: rij.offsetHeight, klaar: vorig !== null }));
    };
    meet();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(meet) : null;
    observer?.observe(ol);
    return () => observer?.disconnect();
  }, [current, error, steps.length]);

  const heeftKop = title || subtitle || icon || status || meta;

  return (
    <div ref={ref} className={cn("lui-steptrack", className)} {...rest}>
      {heeftKop && (
        <div className="lui-steptrack-head">
          {icon !== undefined && <span className="lui-steptrack-tile">{icon}</span>}
          <div className="lui-steptrack-heading">
            {title && <div className="lui-steptrack-title">{title}</div>}
            {subtitle && <div className="lui-steptrack-subtitle">{subtitle}</div>}
          </div>
          {(status || meta) && (
            <div className="lui-steptrack-state">
              {status && (
                <span
                  key={String(status.tone)}
                  className="lui-steptrack-badge"
                  data-tone={status.tone ?? "neutral"}
                  role="status"
                >
                  <span className="lui-steptrack-badge-dot" aria-hidden="true" />
                  {status.label}
                </span>
              )}
              {meta && <span className="lui-steptrack-meta">{meta}</span>}
            </div>
          )}
        </div>
      )}

      <ol className="lui-steptrack-list" ref={lijst}>
        {markering && (
          <span
            className="lui-steptrack-highlight"
            aria-hidden="true"
            data-error={error ? "" : undefined}
            data-ready={markering.klaar ? "" : undefined}
            style={{ transform: `translateY(${markering.y}px)`, height: markering.h }}
          />
        )}
        {steps.map((stap, index) => {
          const s = statusVan(index);
          const volgende = current === -1 && index === 0;
          const onder =
            s === "done"
              ? stap.detail
              : s === "active"
                ? labels?.active ?? "Bezig…"
                : s === "error"
                  ? error?.message
                  : labels?.pending ?? "In afwachting";
          return (
            <li
              key={stap.id ?? index}
              className="lui-steptrack-step"
              data-status={s}
              data-next={volgende ? "" : undefined}
              aria-current={s === "active" || s === "error" ? "step" : undefined}
            >
              <span className="lui-steptrack-marker" aria-hidden="true">
                {s === "done" ? (
                  <Icon key="klaar" name="check" size={11} strokeWidth={3.2} />
                ) : s === "error" ? (
                  <span key="fout" className="lui-steptrack-bang">!</span>
                ) : s === "active" ? (
                  <span key="actief" className="lui-steptrack-marker-icon">
                    {stap.icon ?? <span className="lui-steptrack-core" />}
                  </span>
                ) : null}
              </span>
              <div className="lui-steptrack-body">
                <div className="lui-steptrack-row">
                  <span className="lui-steptrack-name">{stap.title}</span>
                  {stap.icon && <span className="lui-steptrack-icon" aria-hidden="true">{stap.icon}</span>}
                </div>
                <div className="lui-steptrack-row">
                  <span key={s} className="lui-steptrack-sub">
                    {onder}
                  </span>
                  {s === "error" && error?.action ? (
                    <button type="button" className="lui-steptrack-action" onClick={error.action.onClick}>
                      {error.action.label}
                    </button>
                  ) : (
                    s === "done" && stap.time && <span className="lui-steptrack-time">{stap.time}</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {(footer || action) && (
        <div className="lui-steptrack-foot">
          <div className="lui-steptrack-note">{footer}</div>
          {action}
        </div>
      )}
    </div>
  );
});
