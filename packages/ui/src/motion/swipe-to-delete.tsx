"use client";
import * as React from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import type { IconName } from "../icons/icon";

type ZonderBotsingen<E> = Omit<
  React.HTMLAttributes<E>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface SwipeToDeleteProps extends ZonderBotsingen<HTMLDivElement> {
  /** Uitgevoerd zodra de rij ver genoeg geveegd is. */
  onDelete: () => void;
  /** Hoeveel pixels er geveegd moet worden voordat het telt. */
  threshold?: number;
  /** Naar rechts vegen in plaats van naar links. */
  direction?: "left" | "right";
  /** Tekst en icoon op het rode vlak achter de rij. */
  label?: React.ReactNode;
  icon?: IconName;
  /** Vegen uitzetten, bv. voor een rij die niet weg mag. */
  disabled?: boolean;
  /** Knop achter de rij in plaats van meteen verwijderen bij loslaten. */
  confirm?: boolean;
}

/**
 * SwipeToDelete — rij die je opzij veegt om hem te verwijderen. Onder de
 * drempel veert hij terug; erboven glijdt hij helemaal weg.
 */
export const SwipeToDelete = React.forwardRef<HTMLDivElement, SwipeToDeleteProps>(
  function SwipeToDelete(
    {
      onDelete,
      threshold = 96,
      direction = "left",
      label = "Verwijderen",
      icon = "trash",
      disabled,
      confirm,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const [weg, setWeg] = React.useState(false);
    const x = useMotionValue(0);

    const naarLinks = direction === "left";
    const grens = naarLinks ? [-threshold, 0] : [0, threshold];
    /* Het rode vlak wordt sterker naarmate je verder veegt. */
    const dekking = useTransform(x, naarLinks ? [-threshold, 0] : [0, threshold], naarLinks ? [1, 0.25] : [0.25, 1]);

    const verwijder = () => {
      setWeg(true);
      /* Even wachten tot de uitglij-animatie klaar is. */
      window.setTimeout(onDelete, rustig ? 0 : 220);
    };

    return (
      <AnimatePresence>
        {!weg && (
          <motion.div
            ref={ref}
            className={cn("lui-swipe", className)}
            exit={rustig ? { opacity: 0 } : { height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.22 }}
            {...rest}
          >
            <motion.div
              className="lui-swipe-behind"
              data-side={direction}
              style={{ opacity: disabled ? 0 : dekking }}
            >
              {confirm ? (
                <button type="button" className="lui-swipe-confirm" onClick={verwijder}>
                  <Icon name={icon} size={16} />
                  {label}
                </button>
              ) : (
                <span className="lui-swipe-hint">
                  <Icon name={icon} size={16} />
                  {label}
                </span>
              )}
            </motion.div>

            <motion.div
              className="lui-swipe-front"
              style={{ x }}
              drag={disabled ? false : "x"}
              dragConstraints={{ left: naarLinks ? -threshold * 1.6 : 0, right: naarLinks ? 0 : threshold * 1.6 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                const ver = naarLinks ? info.offset.x < -threshold : info.offset.x > threshold;
                if (!ver) {
                  x.set(0);
                  return;
                }
                if (confirm) x.set(naarLinks ? -threshold : threshold);
                else verwijder();
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
