"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";

type ZonderBotsingen<E> = Omit<
  React.HTMLAttributes<E>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface AnimatedListProps extends ZonderBotsingen<HTMLUListElement> {
  /** Hoe een item binnenkomt en vertrekt. */
  animation?: "slide" | "fade" | "scale";
  /** Vanaf welke kant items binnenkomen. */
  from?: "top" | "bottom";
  /** Tijd tussen twee items bij het eerste renderen. */
  stagger?: number;
  duration?: number;
  /** Hoogstens zoveel items tonen; de oudste vallen eraf. */
  max?: number;
  as?: "ul" | "ol" | "div";
}

const VARIANTEN = {
  slide: (van: "top" | "bottom") => ({
    initial: { opacity: 0, y: van === "top" ? -16 : 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: van === "top" ? 16 : -16, scale: 0.98 },
  }),
  fade: () => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }),
  scale: () => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  }),
};

/**
 * AnimatedList — lijst waarin items binnenschuiven en weggaan zonder sprong.
 * Elk kind heeft een stabiele `key` nodig; daarop herkent motion wat nieuw is.
 */
export function AnimatedList({
  animation = "slide",
  from = "top",
  stagger = 0.06,
  duration = 0.34,
  max,
  as = "ul",
  className,
  children,
  ...rest
}: AnimatedListProps) {
  const rustig = useReducedMotion();
  const kinderen = React.Children.toArray(children).filter(React.isValidElement);
  const zichtbaar = max ? kinderen.slice(0, max) : kinderen;
  const variant = VARIANTEN[animation](from);
  const Comp = as === "div" ? motion.div : as === "ol" ? motion.ol : motion.ul;

  return (
    <Comp className={cn("lui-animlist", className)} {...(rest as Record<string, unknown>)}>
      <AnimatePresence initial={false} mode="popLayout">
        {zichtbaar.map((kind, index) => (
          <motion.li
            key={(kind as React.ReactElement).key ?? index}
            className="lui-animlist-item"
            layout={!rustig}
            initial={rustig ? false : variant.initial}
            animate={variant.animate}
            exit={rustig ? undefined : variant.exit}
            transition={{ duration, delay: index * stagger * 0, ease: [0.22, 1, 0.36, 1] }}
          >
            {kind}
          </motion.li>
        ))}
      </AnimatePresence>
    </Comp>
  );
}

export interface AnimatedListItemProps extends ZonderBotsingen<HTMLDivElement> {
  children?: React.ReactNode;
}

/** Losse rij met de opmaak van de library; puur gemak, niet verplicht. */
export const AnimatedListItem = React.forwardRef<HTMLDivElement, AnimatedListItemProps>(
  function AnimatedListItem({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-animlist-row", className)} {...rest} />;
  }
);
