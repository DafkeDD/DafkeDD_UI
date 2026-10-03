"use client";
import * as React from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from "motion/react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { Button } from "../components/button";
import { Icon } from "../icons/icon";
import { useDrawerContext } from "../components/drawer";
import { useEscapeKey, useFocusTrap, useLockScroll } from "../lib/hooks";

/** De DOM-drag- en animatiehandlers botsen met die van motion; die laten we weg. */
type ZonderBotsingen = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface MotionDrawerContentProps extends ZonderBotsingen {
  side?: "left" | "right" | "top" | "bottom";
  /** Breedte (links/rechts) of hoogte (boven/onder). */
  size?: number | string;
  hideClose?: boolean;
  /** Wegvegen om te sluiten (standaard aan). */
  swipeToClose?: boolean;
  /** Hoeveel procent van het paneel je moet wegslepen om te sluiten. */
  swipeThreshold?: number;
  /** Greepje bovenaan, zoals bij een sheet van onderaf. */
  handle?: boolean;
}

/** Richting waarin het paneel dichtgaat, per zijde. */
const AXIS = {
  left: { axis: "x", sign: -1 },
  right: { axis: "x", sign: 1 },
  top: { axis: "y", sign: -1 },
  bottom: { axis: "y", sign: 1 },
} as const;

const SPRING = { type: "spring", stiffness: 420, damping: 40, mass: 0.9 } as const;

/**
 * MotionDrawerContent — zelfde paneel als DrawerContent, maar met veerbeweging,
 * een echte uitgaande animatie en wegvegen om te sluiten.
 *
 * Gebruik het binnen een gewone <Drawer>; header, body en footer blijven hetzelfde.
 */
export const MotionDrawerContent = React.forwardRef<HTMLDivElement, MotionDrawerContentProps>(
  function MotionDrawerContent(
    {
      side = "right",
      size,
      hideClose,
      swipeToClose = true,
      swipeThreshold = 0.35,
      handle,
      className,
      children,
      style,
      ...rest
    },
    ref
  ) {
    const { open, setOpen, titleId } = useDrawerContext("MotionDrawerContent");
    const panelRef = React.useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();
    const reduced = useReducedMotion();

    useEscapeKey(() => setOpen(false), open);
    useLockScroll(open);
    useFocusTrap(panelRef, open);

    const { axis, sign } = AXIS[side];
    const horizontal = axis === "x";
    const hidden = horizontal ? { x: `${sign * 100}%` } : { y: `${sign * 100}%` };

    const onDragEnd = (_event: unknown, info: PanInfo) => {
      const panel = panelRef.current;
      if (!panel) return;
      const afstand = horizontal ? info.offset.x : info.offset.y;
      const snelheid = horizontal ? info.velocity.x : info.velocity.y;
      const lengte = horizontal ? panel.offsetWidth : panel.offsetHeight;
      const ver = afstand * sign > lengte * swipeThreshold;
      const snel = snelheid * sign > 420;
      if (ver || snel) setOpen(false);
    };

    return (
      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              className="lui-overlay lui-overlay-plain lui-motion-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <motion.div
                ref={(node: HTMLDivElement | null) => {
                  panelRef.current = node;
                  if (typeof ref === "function") ref(node as HTMLDivElement);
                  else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={cn("lui-drawer", `lui-drawer-${side}`, "lui-motion-drawer", className)}
                style={{ ...(size ? { [horizontal ? "width" : "height"]: size } : {}), ...style }}
                initial={reduced ? { opacity: 0 } : hidden}
                animate={reduced ? { opacity: 1 } : { x: 0, y: 0 }}
                exit={reduced ? { opacity: 0 } : hidden}
                transition={reduced ? { duration: 0 } : SPRING}
                drag={swipeToClose && !reduced ? axis : false}
                dragControls={dragControls}
                dragListener={!handle}
                dragElastic={{ top: 0, bottom: 0, left: 0, right: 0, [side]: 0.6 }}
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                dragMomentum={false}
                onDragEnd={onDragEnd}
                {...(rest as React.ComponentProps<typeof motion.div>)}
              >
                {handle && (
                  <div
                    className={cn("lui-motion-handle", horizontal && "lui-motion-handle-vertical")}
                    onPointerDown={(event) => dragControls.start(event)}
                  >
                    <span />
                  </div>
                )}
                {!hideClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lui-drawer-close"
                    aria-label="Sluiten"
                    icon={<Icon name="x" size={16} />}
                    onClick={() => setOpen(false)}
                  />
                )}
                {children}
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    );
  }
);
