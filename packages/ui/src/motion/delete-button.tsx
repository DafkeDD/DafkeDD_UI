"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useAction } from "./use-action";

export interface DeleteButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  children?: React.ReactNode;
  deletedLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
  /** Verwijdert echt; `false` of een fout toont de foutstatus. */
  onDelete?: () => boolean | void | Promise<boolean | void>;
  onDeleted?: () => void;
  resetAfter?: number | false;
  /** Zachte variant: rode tint in plaats van een volle rode knop. */
  tone?: "solid" | "soft";
}

/**
 * DeleteButton — de vuilnisbak schuift over het label heen en eet het op; de
 * knop krimpt tot het bakje en bevestigt daarna wat er gebeurd is.
 */
export const DeleteButton = React.forwardRef<HTMLButtonElement, DeleteButtonProps>(
  function DeleteButton(
    {
      children = "Verwijderen",
      deletedLabel = "Verwijderd",
      errorLabel = "Niet gelukt",
      onDelete,
      onDeleted,
      resetAfter = 2400,
      tone = "solid",
      className,
      disabled,
      ...rest
    },
    ref
  ) {
    const traag = useReducedMotion();
    const { stage, run } = useAction({ onAction: onDelete, onDone: onDeleted, duration: 900, resetAfter });
    const bezig = stage === "busy";
    const klaar = stage === "done";
    const fout = stage === "error";

    return (
      <motion.button
        ref={ref}
        type="button"
        layout
        data-state={stage}
        className={cn("lui-delb", `lui-delb-${tone}`, className)}
        disabled={disabled || bezig || klaar}
        onClick={() => void run()}
        transition={traag ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
        {...(rest as React.ComponentProps<typeof motion.button>)}
      >
        {/* de bak: het deksel wipt open en ze schuift over het label */}
        <motion.span
          layout="position"
          className="lui-delb-bin"
          animate={
            bezig && !traag
              ? { x: [0, 6, 10, 0], rotate: [0, -10, 5, 0], scale: [1, 1.12, 1.12, 1] }
              : { x: 0, rotate: 0 }
          }
          transition={{ duration: traag ? 0 : 0.85, times: [0, 0.2, 0.62, 1], ease: "easeInOut" }}
          aria-hidden="true"
        >
          <motion.span
            className="lui-delb-lid"
            animate={bezig && !traag ? { rotate: [-2, -36, -36, -2], y: [0, -2, -2, 0] } : { rotate: 0, y: 0 }}
            transition={{ duration: traag ? 0 : 0.85, times: [0, 0.2, 0.62, 1] }}
          />
          <Icon name={klaar ? "check" : fout ? "alertCircle" : "trash"} size={16} />
        </motion.span>

        <AnimatePresence mode="popLayout" initial={false}>
          {!bezig && (
            <motion.span
              key={stage}
              className="lui-delb-label"
              initial={{ opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.2, filter: "blur(2px)" }}
              transition={{ duration: traag ? 0 : 0.22 }}
            >
              {klaar ? deletedLabel : fout ? errorLabel : children}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);
