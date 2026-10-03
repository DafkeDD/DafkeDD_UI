"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface LoaderStep {
  label: React.ReactNode;
  /** Afwijkende duur voor deze stap, in milliseconden. */
  duration?: number;
}

export interface MultiStepLoaderProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "title" | "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  steps: Array<LoaderStep | string>;
  /** Zet de stappen in gang. */
  loading?: boolean;
  /** Huidige stap zelf sturen; zonder dit loopt hij op de klok. */
  step?: number;
  /** Standaardduur per stap in milliseconden. */
  duration?: number;
  /** Aangeroepen zodra de laatste stap voorbij is. */
  onComplete?: () => void;
  /** Blijft op de laatste stap staan in plaats van opnieuw te beginnen. */
  loop?: boolean;
  /** Over het hele scherm met een waas erachter. */
  overlay?: boolean;
  title?: React.ReactNode;
}

/**
 * MultiStepLoader — wachtscherm dat vertelt wát er gebeurt in plaats van
 * alleen te draaien. Stappen kleuren af naarmate ze klaar zijn.
 */
export const MultiStepLoader = React.forwardRef<HTMLDivElement, MultiStepLoaderProps>(
  function MultiStepLoader(
    { steps, loading = true, step, duration = 1400, onComplete, loop, overlay, title, className, ...rest },
    ref
  ) {
    const rustig = useReducedMotion();
    const lijst = React.useMemo(
      () => steps.map((item) => (typeof item === "string" ? { label: item } : item)),
      [steps]
    );

    const [intern, setIntern] = React.useState(0);
    const huidig = step ?? intern;
    const klaarMelden = React.useRef(onComplete);
    klaarMelden.current = onComplete;

    React.useEffect(() => {
      if (!loading || step !== undefined) return;
      if (huidig >= lijst.length) return;
      const wacht = lijst[huidig]?.duration ?? duration;
      const timer = window.setTimeout(() => {
        setIntern((vorige) => {
          const volgende = vorige + 1;
          if (volgende >= lijst.length) {
            if (loop) return 0;
            klaarMelden.current?.();
            return vorige + 1;
          }
          return volgende;
        });
      }, wacht);
      return () => window.clearTimeout(timer);
    }, [loading, huidig, lijst, duration, loop, step]);

    /* Opnieuw beginnen zodra loading weer aangaat. */
    React.useEffect(() => {
      if (!loading) setIntern(0);
    }, [loading]);

    if (!loading) return null;

    const inhoud = (
      <div ref={ref} className={cn("lui-loader", className)} role="status" aria-live="polite" {...rest}>
        {title && <p className="lui-loader-title">{title}</p>}
        <ol className="lui-loader-steps">
          {lijst.map((stap, index) => {
            const gedaan = index < huidig;
            const bezig = index === huidig;
            return (
              <motion.li
                key={index}
                className="lui-loader-step"
                data-state={gedaan ? "done" : bezig ? "busy" : "todo"}
                initial={rustig ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: bezig ? 1 : gedaan ? 0.7 : 0.35, y: 0 }}
                transition={{ duration: 0.3, delay: rustig ? 0 : index * 0.04 }}
              >
                <span className="lui-loader-mark">
                  {gedaan ? (
                    <Icon name="check" size={13} />
                  ) : bezig ? (
                    <span className="lui-loader-spin" />
                  ) : (
                    <span className="lui-loader-dot" />
                  )}
                </span>
                <span className="lui-loader-label">{stap.label}</span>
              </motion.li>
            );
          })}
        </ol>
      </div>
    );

    if (!overlay) return inhoud;

    return (
      <AnimatePresence>
        <motion.div
          className="lui-loader-overlay"
          initial={rustig ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {inhoud}
        </motion.div>
      </AnimatePresence>
    );
  }
);
