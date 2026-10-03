"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";
import { useAction } from "./use-action";

export interface AddToCartButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  children?: React.ReactNode;
  /** Aantal in het mandje; laat weg voor een eigen telling. */
  count?: number;
  defaultCount?: number;
  onCountChange?: (count: number) => void;
  /** Regel onder de knop; `{count}` wordt vervangen. Zet op null om ze weg te laten. */
  hint?: string | null;
  /** Legt het artikel echt in het mandje; `false` of een fout laat de telling ongemoeid. */
  onAdd?: () => boolean | void | Promise<boolean | void>;
  block?: boolean;
}

/**
 * AddToCartButton — de knop trekt zich samen tot een mandje, het artikel valt
 * erin en de teller springt een omhoog. Daarna klapt ze weer open.
 */
export const AddToCartButton = React.forwardRef<HTMLButtonElement, AddToCartButtonProps>(
  function AddToCartButton(
    {
      children = "In het mandje",
      count,
      defaultCount = 0,
      onCountChange,
      hint = "{count} in je mandje",
      onAdd,
      block,
      className,
      disabled,
      ...rest
    },
    ref
  ) {
    const traag = useReducedMotion();
    const [aantal, setAantal] = useControllableState<number>({
      value: count,
      defaultValue: defaultCount,
      onChange: onCountChange,
    });

    const { stage, run } = useAction({
      onAction: onAdd,
      duration: 900,
      resetAfter: 220,
      onDone: () => setAantal((vorig) => vorig + 1),
    });
    const bezig = stage === "busy";

    return (
      <span className={cn("lui-cartb-wrap", block && "lui-cartb-wrap-block")}>
        <motion.button
          ref={ref}
          type="button"
          layout
          data-state={stage}
          className={cn("lui-cartb", block && !bezig && "lui-cartb-block", className)}
          disabled={disabled || bezig}
          onClick={() => void run()}
          transition={traag ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }}
          {...(rest as React.ComponentProps<typeof motion.button>)}
        >
          <motion.span layout="position" className="lui-cartb-icon">
            <Icon name="cart" size={18} />
          </motion.span>
          <AnimatePresence initial={false}>
            {!bezig && (
              <motion.span
                key="label"
                className="lui-cartb-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: traag ? 0 : 0.15 }}
              >
                {children}
              </motion.span>
            )}
          </AnimatePresence>

          {/* het artikel valt in het mandje */}
          <AnimatePresence>
            {bezig && !traag && (
              <motion.span
                key="item"
                className="lui-cartb-item"
                initial={{ y: -34, opacity: 0, scale: 0.7, rotate: -12 }}
                animate={{ y: [-34, -6, 2], opacity: [0, 1, 1], scale: [0.7, 1, 0.5], rotate: [-12, 0, 6] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: "easeIn", times: [0, 0.6, 1] }}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
        </motion.button>

        {hint !== null && (
          <span className="lui-cartb-hint" aria-live="polite">
            <motion.strong
              key={aantal}
              initial={{ y: traag ? 0 : -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: traag ? 0 : 0.25 }}
            >
              {aantal}
            </motion.strong>
            {hint.replace("{count}", "").trim()}
          </span>
        )}
      </span>
    );
  }
);
