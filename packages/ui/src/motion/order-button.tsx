"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useAction } from "./use-action";

export interface OrderButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  children?: React.ReactNode;
  /** Tekst na een geslaagde bestelling. */
  orderedLabel?: React.ReactNode;
  errorLabel?: React.ReactNode;
  /** Plaatst de bestelling; `false` of een fout toont de foutstatus. */
  onOrder?: () => boolean | void | Promise<boolean | void>;
  onOrdered?: () => void;
  resetAfter?: number | false;
  block?: boolean;
}

/**
 * OrderButton — bij het bestellen rijdt er een bestelwagen door de knop; daarna
 * staat er groen "besteld". De rit duurt even, dus je backend mag even denken.
 */
export const OrderButton = React.forwardRef<HTMLButtonElement, OrderButtonProps>(function OrderButton(
  {
    children = "Nu bestellen",
    orderedLabel = "Besteld",
    errorLabel = "Niet gelukt",
    onOrder,
    onOrdered,
    resetAfter = 3200,
    block,
    className,
    disabled,
    ...rest
  },
  ref
) {
  const traag = useReducedMotion();
  const { stage, run } = useAction({ onAction: onOrder, onDone: onOrdered, duration: 1500, resetAfter });
  const bezig = stage === "busy";
  const klaar = stage === "done";
  const fout = stage === "error";

  return (
    <button
      ref={ref}
      type="button"
      data-state={stage}
      className={cn("lui-orderb", block && "lui-orderb-block", className)}
      disabled={disabled || bezig || klaar}
      onClick={() => void run()}
      {...rest}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={stage}
          className="lui-orderb-label"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: bezig ? 0 : 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: traag ? 0 : 0.22 }}
        >
          {klaar && <Icon name="checkCircle" size={16} />}
          {fout && <Icon name="alertCircle" size={16} />}
          {!bezig && !klaar && !fout && <Icon name="cart" size={16} />}
          {klaar ? orderedLabel : fout ? errorLabel : children}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {bezig && (
          <motion.span
            key="truck"
            className="lui-orderb-truck"
            initial={{ x: "-130%", opacity: 0 }}
            animate={traag ? { x: "0%", opacity: 1 } : { x: ["-130%", "0%", "130%"], opacity: [0, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: traag ? 0 : 1.4, ease: "easeInOut", times: [0, 0.45, 1] }}
            aria-hidden="true"
          >
            <Icon name="truck" size={22} />
            <span className="lui-orderb-dust" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
});
