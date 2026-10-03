"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useAction, type ActionStage } from "./use-action";

type ZonderBotsingen = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface MorphButtonProps extends ZonderBotsingen {
  /** Het werk. Geef `false` terug of gooi een fout voor de foutstatus. */
  onAction?: () => boolean | void | Promise<boolean | void>;
  /** Minimale speelduur in ms, ook als de server sneller is. */
  duration?: number;
  /** Terug naar het begin na zoveel ms; false blijft op het resultaat staan. */
  resetAfter?: number | false;
  onDone?: () => void;
  tone?: "accent" | "green" | "red" | "violet";
  size?: "sm" | "md" | "lg";
  /** Tekst bij de eindstand; laat weg voor alleen het vinkje. */
  doneLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
  disabled?: boolean;
  /** Toegankelijke omschrijving van wat er gebeurt. */
  busyLabel?: string;
}

/**
 * MorphButton — knop die bij het indrukken samentrekt tot een cirkel, daarin
 * draait, en als vinkje weer openklapt. Eén vloeiende beweging in plaats van
 * een knop die ineens een spinner wordt.
 */
export const MorphButton = React.forwardRef<HTMLButtonElement, MorphButtonProps>(
  function MorphButton(
    {
      onAction,
      duration = 1200,
      resetAfter = 2200,
      onDone,
      tone = "accent",
      size = "md",
      doneLabel,
      errorLabel,
      disabled,
      busyLabel = "Bezig",
      className,
      children,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const { stage, run } = useAction({ onAction, duration, resetAfter, onDone });

    const cirkel: ActionStage[] = ["busy"];
    const isCirkel = cirkel.includes(stage);
    const klaar = stage === "done" || stage === "error";
    const toon = stage === "error" ? "red" : stage === "done" ? "green" : tone;

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn("lui-morphbtn", `lui-morphbtn-${size}`, className)}
        data-state={stage}
        data-tone={toon}
        data-round={isCirkel || (klaar && !doneLabel && !errorLabel) ? "" : undefined}
        onClick={() => void run()}
        disabled={disabled || stage === "busy"}
        aria-live="polite"
        aria-busy={stage === "busy" || undefined}
        layout={!rustig}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        {...rest}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {stage === "idle" && (
            <motion.span
              key="idle"
              className="lui-morphbtn-label"
              initial={rustig ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={rustig ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.16 }}
            >
              {children}
            </motion.span>
          )}

          {stage === "busy" && (
            <motion.span
              key="busy"
              className="lui-morphbtn-spinner"
              aria-label={busyLabel}
              initial={rustig ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={rustig ? undefined : { opacity: 0 }}
              transition={{ duration: 0.16 }}
            />
          )}

          {klaar && (
            <motion.span
              key="klaar"
              className="lui-morphbtn-label"
              initial={rustig ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={rustig ? undefined : { opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 520, damping: 26 }}
            >
              <Icon name={stage === "done" ? "check" : "x"} size={18} strokeWidth={2.6} />
              {stage === "done" ? doneLabel : errorLabel}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);
