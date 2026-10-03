"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useAction } from "./use-action";

type ZonderBotsingen = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface PublishButtonTexts {
  idle: React.ReactNode;
  busy: React.ReactNode;
  done: React.ReactNode;
  error: React.ReactNode;
}

export interface PublishButtonProps extends ZonderBotsingen {
  /** Het publiceren zelf. `false` of een fout geeft de foutstatus. */
  onPublish?: () => boolean | void | Promise<boolean | void>;
  /** Minimale speelduur in ms. */
  duration?: number;
  resetAfter?: number | false;
  onDone?: () => void;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  texts?: Partial<PublishButtonTexts>;
}

const STANDAARD: PublishButtonTexts = {
  idle: "Publiceren",
  busy: "Bezig…",
  done: "Gepubliceerd",
  error: "Mislukt",
};

/**
 * PublishButton — wolkje met een pijl die blijft opstijgen zolang het
 * publiceren loopt, en een label dat per stap omhoog oprolt. Klaar wordt de
 * wolk een vinkje.
 */
export const PublishButton = React.forwardRef<HTMLButtonElement, PublishButtonProps>(
  function PublishButton(
    {
      onPublish,
      duration = 1600,
      resetAfter = 2400,
      onDone,
      variant = "dark",
      size = "md",
      texts,
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const woorden = { ...STANDAARD, ...texts, ...(children ? { idle: children } : {}) };
    const { stage, run } = useAction({ onAction: onPublish, duration, resetAfter, onDone });

    const label = woorden[stage];

    // De knop verandert vloeiend van breedte wanneer het label wisselt: we
    // meten het nieuwe label en laten de rol daarnaartoe groeien of krimpen.
    const rol = React.useRef<HTMLSpanElement>(null);
    const [breedte, setBreedte] = React.useState<number>();
    React.useLayoutEffect(() => {
      const maat = rol.current?.querySelector<HTMLElement>(".lui-publish-measure");
      if (maat) setBreedte(maat.offsetWidth);
    }, [stage, label]);

    return (
      <button
        ref={ref}
        type="button"
        className={cn("lui-publish", `lui-publish-${variant}`, `lui-publish-${size}`, className)}
        data-state={stage}
        onClick={() => void run()}
        disabled={disabled || stage === "busy"}
        aria-live="polite"
        aria-busy={stage === "busy" || undefined}
        {...rest}
      >
        <span className="lui-publish-icon" aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false}>
            {stage === "done" || stage === "error" ? (
              <motion.span
                key="klaar"
                className="lui-publish-badge"
                initial={rustig ? false : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={rustig ? undefined : { scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 24 }}
              >
                <Icon name={stage === "done" ? "check" : "x"} size={11} strokeWidth={3} />
              </motion.span>
            ) : (
              <motion.span
                key="wolk"
                className="lui-publish-cloud"
                initial={rustig ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={rustig ? undefined : { scale: 0.6, opacity: 0 }}
              >
                <Icon name="cloud" size={18} />
                {/* Tijdens het publiceren glijden wolkjes langs een stilstaande pijl: je vliegt omhoog. */}
                <span className="lui-publish-sky" aria-hidden="true">
                  <Icon name="cloud" size={15} />
                  <Icon name="cloud" size={12} />
                </span>
                <span className="lui-publish-arrow">
                  <Icon name="arrowUp" size={10} strokeWidth={2.8} />
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <span className="lui-publish-roll" ref={rol} style={breedte ? { width: breedte } : undefined}>
          <span className="lui-publish-measure" aria-hidden="true">
            {label}
          </span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={stage}
              className="lui-publish-label"
              initial={rustig ? false : { y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={rustig ? undefined : { y: "-110%", opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
    );
  }
);
