"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "type"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Toont de actuele waarde rechtsboven. */
  showValue?: boolean;
  /** Formatteert de getoonde waarde, bv. (v) => `${v}%`. */
  format?: (value: number) => string;
  tone?: "accent" | "green" | "amber" | "red";
}

/** Slider — schuifregelaar bovenop een echte <input type="range">. */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    defaultValue = 0,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    showValue,
    format,
    tone = "accent",
    className,
    disabled,
    ...rest
  },
  ref
) {
  const [current, setCurrent] = useControllableState<number>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;

  return (
    <div className={cn("lui-slider", `lui-slider-${tone}`, disabled && "lui-slider-disabled", className)}>
      {showValue && (
        <div className="lui-slider-value">{format ? format(current) : current}</div>
      )}
      <input
        ref={ref}
        type="range"
        className="lui-slider-input"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        style={{ ["--lui-slider-fill" as string]: `${percent}%` }}
        onChange={(event) => setCurrent(Number(event.target.value))}
        {...rest}
      />
    </div>
  );
});
