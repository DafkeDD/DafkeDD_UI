"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Portal } from "../lib/portal";
import { useControllableState, useEscapeKey } from "../lib/hooks";

export interface TourStep {
  /** CSS-selector van het element dat uitgelicht wordt; leeg voor een kaartje in het midden. */
  target?: string;
  title: React.ReactNode;
  content: React.ReactNode;
  /** Voorkeurskant; het kaartje wijkt zelf uit als er geen plaats is. */
  side?: "top" | "bottom" | "left" | "right";
  /** Ruimte rond het uitgelichte element. */
  padding?: number;
  /** Uitgevoerd zodra deze stap in beeld komt. */
  onEnter?: () => void;
}

export interface TourProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Aangeroepen wanneer de laatste stap wordt afgerond. */
  onFinish?: () => void;
  /** Aangeroepen bij overslaan of Escape. */
  onSkip?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  finishLabel?: string;
  skipLabel?: string;
  /** Bolletjes met de voortgang onderaan het kaartje. */
  showProgress?: boolean;
  /** Klikken op de achtergrond sluit de rondleiding. */
  closeOnBackdrop?: boolean;
}

interface Kader {
  top: number;
  left: number;
  width: number;
  height: number;
}

const RAND = 12;

/**
 * Tour — rondleiding die stap voor stap een element uitlicht met een kaartje
 * ernaast. Het gat in de overlay volgt het element, ook bij scrollen.
 */
export const Tour = React.forwardRef<HTMLDivElement, TourProps>(function Tour(
  {
    steps,
    open,
    onOpenChange,
    step,
    defaultStep = 0,
    onStepChange,
    onFinish,
    onSkip,
    nextLabel = "Volgende",
    prevLabel = "Vorige",
    finishLabel = "Klaar",
    skipLabel = "Overslaan",
    showProgress = true,
    closeOnBackdrop,
    className,
    ...rest
  },
  ref
) {
  const [huidig, setHuidig] = useControllableState<number>({
    value: step,
    defaultValue: defaultStep,
    onChange: onStepChange,
  });

  const [kader, setKader] = React.useState<Kader | null>(null);
  const [venster, setVenster] = React.useState({ width: 1024, height: 768 });
  const kaart = React.useRef<HTMLDivElement>(null);

  const stap = steps[Math.min(Math.max(huidig, 0), Math.max(steps.length - 1, 0))];

  const stoppen = React.useCallback(() => {
    onOpenChange(false);
    onSkip?.();
  }, [onOpenChange, onSkip]);

  useEscapeKey(stoppen, open);

  /* Het gat opnieuw opmeten bij elke stap, en bij scrollen of formaatwijziging. */
  React.useEffect(() => {
    if (!open || !stap) return;

    const meet = () => {
      setVenster({ width: window.innerWidth, height: window.innerHeight });
      if (!stap.target) {
        setKader(null);
        return;
      }
      const el = document.querySelector(stap.target);
      if (!el) {
        setKader(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      const marge = stap.padding ?? 6;
      setKader({
        top: rect.top - marge,
        left: rect.left - marge,
        width: rect.width + marge * 2,
        height: rect.height + marge * 2,
      });
    };

    const el = stap.target ? document.querySelector(stap.target) : null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    /* Na het scrollen nog eens meten, anders staat het gat op de oude plek. */
    const timer = window.setTimeout(meet, 320);
    meet();

    window.addEventListener("scroll", meet, true);
    window.addEventListener("resize", meet);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", meet, true);
      window.removeEventListener("resize", meet);
    };
  }, [open, stap]);

  React.useEffect(() => {
    if (open) stap?.onEnter?.();
  }, [open, stap]);

  React.useEffect(() => {
    if (open) kaart.current?.focus({ preventScroll: true });
  }, [open, huidig]);

  if (!open || !stap) return null;

  const laatste = huidig >= steps.length - 1;
  const volgende = () => {
    if (laatste) {
      onOpenChange(false);
      onFinish?.();
    } else {
      setHuidig(huidig + 1);
    }
  };

  /* Kaartje plaatsen: onder het gat, of erboven als het daar niet past. */
  const kaartBreedte = 320;
  let kaartStijl: React.CSSProperties;
  if (!kader) {
    kaartStijl = { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: kaartBreedte };
  } else {
    const voorkeur = stap.side ?? "bottom";
    const ruimteOnder = venster.height - (kader.top + kader.height);
    const onder = voorkeur === "top" ? ruimteOnder > 260 : ruimteOnder > 180;
    const links = Math.min(
      Math.max(kader.left + kader.width / 2 - kaartBreedte / 2, RAND),
      Math.max(venster.width - kaartBreedte - RAND, RAND)
    );
    kaartStijl = onder
      ? { top: kader.top + kader.height + RAND, left: links, width: kaartBreedte }
      : { top: Math.max(kader.top - RAND, RAND), left: links, width: kaartBreedte, transform: "translateY(-100%)" };
  }

  return (
    <Portal>
      <div ref={ref} className={cn("lui-tour", className)} {...rest}>
        <div
          className="lui-tour-overlay"
          onClick={closeOnBackdrop ? stoppen : undefined}
          style={
            kader
              ? {
                  /* Eén overlay met een gat erin: goedkoper en scherper dan vier panelen. */
                  clipPath: `polygon(
                    0% 0%, 0% 100%, ${kader.left}px 100%, ${kader.left}px ${kader.top}px,
                    ${kader.left + kader.width}px ${kader.top}px,
                    ${kader.left + kader.width}px ${kader.top + kader.height}px,
                    ${kader.left}px ${kader.top + kader.height}px, ${kader.left}px 100%,
                    100% 100%, 100% 0%
                  )`,
                }
              : undefined
          }
        />

        {kader && (
          <div
            className="lui-tour-ring"
            style={{ top: kader.top, left: kader.left, width: kader.width, height: kader.height }}
            aria-hidden="true"
          />
        )}

        <div
          ref={kaart}
          className="lui-tour-card"
          style={kaartStijl}
          role="dialog"
          aria-modal="true"
          aria-label={typeof stap.title === "string" ? stap.title : "Rondleiding"}
          tabIndex={-1}
        >
          <button type="button" className="lui-tour-close" onClick={stoppen} aria-label="Sluiten">
            <Icon name="x" size={15} />
          </button>

          <h3 className="lui-tour-title">{stap.title}</h3>
          <div className="lui-tour-content">{stap.content}</div>

          <div className="lui-tour-foot">
            {showProgress ? (
              <div className="lui-tour-dots" aria-hidden="true">
                {steps.map((_, index) => (
                  <span key={index} className="lui-tour-dot" data-active={index === huidig ? "" : undefined} />
                ))}
              </div>
            ) : (
              <span className="lui-tour-count">
                {huidig + 1} / {steps.length}
              </span>
            )}

            <div className="lui-tour-actions">
              {!laatste && (
                <button type="button" className="lui-tour-btn" onClick={stoppen}>
                  {skipLabel}
                </button>
              )}
              {huidig > 0 && (
                <button type="button" className="lui-tour-btn" onClick={() => setHuidig(huidig - 1)}>
                  {prevLabel}
                </button>
              )}
              <button type="button" className="lui-tour-btn" data-primary="" onClick={volgende}>
                {laatste ? finishLabel : nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
});
