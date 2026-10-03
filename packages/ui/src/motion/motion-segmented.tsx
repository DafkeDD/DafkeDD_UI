"use client";
import * as React from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";
import type { SegmentedProps } from "../components/segmented";

export interface MotionSegmentedProps extends SegmentedProps {
  /** Eigen id wanneer er meerdere schakelaars naast elkaar staan. */
  layoutId?: string;
}

/**
 * MotionSegmented — dezelfde API als Segmented, maar de actieve achtergrond
 * schuift mee naar de knop die je kiest in plaats van te verspringen.
 */
export const MotionSegmented = React.forwardRef<HTMLDivElement, MotionSegmentedProps>(function MotionSegmented(
  { options, value, defaultValue, onValueChange, size = "md", block, layoutId, className, ...rest },
  ref
) {
  const auto = React.useId();
  const id = layoutId ?? `lui-segmented-${auto}`;
  const reduced = useReducedMotion();

  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue: defaultValue ?? options[0]?.value,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });

  return (
    <LayoutGroup id={id}>
      <div
        ref={ref}
        role="tablist"
        className={cn(
          "lui-segmented",
          `lui-segmented-${size}`,
          block && "lui-segmented-block",
          "lui-motion-segmented",
          className
        )}
        {...rest}
      >
        {options.map((option) => {
          const active = current === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={option.ariaLabel}
              disabled={option.disabled}
              data-state={active ? "active" : "inactive"}
              className="lui-segmented-item"
              onClick={() => setCurrent(option.value)}
            >
              {active && (
                <motion.span
                  layoutId="lui-segmented-indicator"
                  className="lui-motion-segmented-indicator"
                  transition={
                    reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 38, mass: 0.7 }
                  }
                />
              )}
              {option.icon && <span className="lui-segmented-icon">{option.icon}</span>}
              {option.label}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
});
