"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useAction } from "./use-action";

export interface SendButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  children?: React.ReactNode;
  /** Tekst nadat het gelukt is. */
  sentLabel?: React.ReactNode;
  /** Tekst wanneer het misliep. */
  errorLabel?: React.ReactNode;
  /** Verstuurt echt iets; `false` of een fout toont de foutstatus. */
  onSend?: () => boolean | void | Promise<boolean | void>;
  onSent?: () => void;
  /** Terug naar het begin na zoveel ms; `false` blijft op "verzonden" staan. */
  resetAfter?: number | false;
}

/**
 * SendButton — de knop vouwt zich bij het versturen tot een papieren vliegtuigje
 * dat wegvliegt, en komt terug als een rustige "verzonden"-knop.
 */
export const SendButton = React.forwardRef<HTMLButtonElement, SendButtonProps>(function SendButton(
  {
    children = "Versturen",
    sentLabel = "Verzonden",
    errorLabel = "Niet gelukt",
    onSend,
    onSent,
    resetAfter = 2600,
    className,
    disabled,
    ...rest
  },
  ref
) {
  const traag = useReducedMotion();
  const { stage, run } = useAction({ onAction: onSend, onDone: onSent, duration: 820, resetAfter });
  const bezig = stage === "busy";
  const klaar = stage === "done";
  const fout = stage === "error";

  return (
    <span className="lui-sendb-wrap">
      <motion.button
        ref={ref}
        type="button"
        layout
        data-state={stage}
        className={cn("lui-sendb", className)}
        disabled={disabled || bezig || klaar}
        onClick={() => void run()}
        animate={{ opacity: bezig && !traag ? 0 : 1, scale: bezig && !traag ? 0.9 : 1 }}
        transition={{ duration: traag ? 0 : 0.2 }}
        {...(rest as React.ComponentProps<typeof motion.button>)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={stage}
            className="lui-sendb-label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: traag ? 0 : 0.2 }}
          >
            {klaar && <Icon name="check" size={15} />}
            {fout && <Icon name="alertCircle" size={15} />}
            {klaar ? sentLabel : fout ? errorLabel : children}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* het vliegtuigje vertrekt zodra de knop wegvalt */}
      <AnimatePresence>
        {bezig && !traag && (
          <motion.span
            key="plane"
            className="lui-sendb-plane"
            initial={{ x: 0, y: 0, scale: 0.7, rotate: -8, opacity: 0 }}
            animate={{ x: [0, 14, 150], y: [0, -6, -90], scale: [0.7, 1, 0.55], rotate: [-8, -12, -24], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeIn", times: [0, 0.25, 1] }}
            aria-hidden="true"
          >
            <Icon name="send" size={22} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
});
