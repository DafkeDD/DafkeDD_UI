"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

export interface SegmentedOption {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Toegankelijk label wanneer er alleen een icoon staat. */
  ariaLabel?: string;
}

export interface SegmentedProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: "sm" | "md";
  /** Vult de beschikbare breedte. */
  block?: boolean;
}

/** Segmented — compacte keuzeschakelaar (view-switch, filter). */
export const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  { options, value, defaultValue, onValueChange, size = "md", block, className, ...rest },
  ref
) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue: defaultValue ?? options[0]?.value,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });

  return (
    <div
      ref={ref}
      role="tablist"
      className={cn("lui-segmented", `lui-segmented-${size}`, block && "lui-segmented-block", className)}
      {...rest}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={current === option.value}
          aria-label={option.ariaLabel}
          disabled={option.disabled}
          data-state={current === option.value ? "active" : "inactive"}
          className="lui-segmented-item"
          onClick={() => setCurrent(option.value)}
        >
          {option.icon && <span className="lui-segmented-icon">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
});
