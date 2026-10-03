"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import type { IconName } from "../icons/icon";

type ZonderBotsingen = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface HoldToConfirmProps extends ZonderBotsingen {
  /** Uitgevoerd zodra de knop lang genoeg is ingedrukt. */
  onConfirm: () => void;
  /** Hoe lang er ingedrukt moet worden, in milliseconden. */
  duration?: number;
  tone?: "accent" | "red";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
  /** Tekst tijdens het indrukken. */
  holdingLabel?: React.ReactNode;
  /** Tekst na het bevestigen. */
  doneLabel?: React.ReactNode;
  /** Hoe lang de bevestiging blijft staan; 0 laat hem staan. */
  resetAfter?: number;
}

/**
 * HoldToConfirm — knop die je even ingedrukt moet houden. Geen dialoog voor
 * "weet je het zeker", maar een handeling die je bewust volhoudt.
 */
export const HoldToConfirm = React.forwardRef<HTMLButtonElement, HoldToConfirmProps>(
  function HoldToConfirm(
    {
      onConfirm,
      duration = 1200,
      tone = "red",
      size = "md",
      icon,
      holdingLabel,
      doneLabel = "Bevestigd",
      resetAfter = 2000,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const [stand, setStand] = React.useState<"idle" | "busy" | "done">("idle");
    const timer = React.useRef<number | undefined>(undefined);
    const herstel = React.useRef<number | undefined>(undefined);

    React.useEffect(
      () => () => {
        window.clearTimeout(timer.current);
        window.clearTimeout(herstel.current);
      },
      []
    );

    const start = () => {
      if (disabled || stand !== "idle") return;
      setStand("busy");
      /* Bij rustige beweging is vasthouden onnodig traag; dan meteen bevestigen. */
      timer.current = window.setTimeout(
        () => {
          setStand("done");
          onConfirm();
          if (resetAfter > 0) herstel.current = window.setTimeout(() => setStand("idle"), resetAfter);
        },
        rustig ? 220 : duration
      );
    };

    const stop = () => {
      if (stand !== "busy") return;
      window.clearTimeout(timer.current);
      setStand("idle");
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn("lui-hold", `lui-hold-${size}`, className)}
        data-tone={tone}
        data-state={stand}
        disabled={disabled}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            if (!event.repeat) start();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") stop();
        }}
        aria-live="polite"
        {...rest}
      >
        <motion.span
          className="lui-hold-fill"
          initial={false}
          animate={{ scaleX: stand === "idle" ? 0 : 1 }}
          transition={{
            duration: stand === "busy" ? (rustig ? 0.22 : duration / 1000) : 0.18,
            ease: "linear",
          }}
        />
        <span className="lui-hold-label">
          {stand === "done" ? (
            <>
              <Icon name="check" size={16} />
              {doneLabel}
            </>
          ) : (
            <>
              {icon && <Icon name={icon} size={16} />}
              {stand === "busy" && holdingLabel ? holdingLabel : children}
            </>
          )}
        </span>
      </button>
    );
  }
);
