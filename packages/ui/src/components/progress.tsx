"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { CountUp } from "../lib/count-up";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Waarde tussen 0 en `max`. Laat weg voor een onbepaalde balk. */
  value?: number;
  max?: number;
  tone?: "accent" | "green" | "amber" | "red" | "blue";
  size?: "sm" | "md" | "lg";
  /** Label boven de balk. */
  label?: React.ReactNode;
  /** Toont het percentage rechtsboven. */
  showValue?: boolean;
}

/** Progress — voortgangsbalk, bepaald of onbepaald. */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value, max = 100, tone = "accent", size = "md", label, showValue, className, ...rest },
  ref
) {
  const indeterminate = value === undefined || value === null;
  const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div ref={ref} className={cn("lui-progress-wrap", className)} {...rest}>
      {(label || showValue) && (
        <div className="lui-progress-head">
          {label && <span className="lui-progress-label">{label}</span>}
          {showValue && !indeterminate && (
            <span className="lui-progress-value">
              <CountUp value={Math.round(percent)} />%
            </span>
          )}
        </div>
      )}
      <div
        className={cn("lui-progress", `lui-progress-${size}`, `lui-progress-${tone}`)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
      >
        <div
          className={cn("lui-progress-bar", indeterminate && "lui-progress-bar-indeterminate")}
          style={indeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
});

export interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: number;
  thickness?: number;
  tone?: "accent" | "green" | "amber" | "red" | "blue";
  /** Toont het percentage in het midden. */
  showValue?: boolean;
}

/** ProgressCircle — ronde voortgangsindicator. */
export const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
  function ProgressCircle(
    { value = 0, max = 100, size = 56, thickness = 5, tone = "accent", showValue, className, ...rest },
    ref
  ) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
      <div
        ref={ref}
        className={cn("lui-progress-circle", `lui-progress-${tone}`, className)}
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...rest}
      >
        <svg width={size} height={size}>
          <circle
            className="lui-progress-circle-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            fill="none"
          />
          <circle
            className="lui-progress-circle-bar"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percent / 100) * circumference}
            style={{ "--lui-circ": circumference } as React.CSSProperties}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {showValue && (
          <span className="lui-progress-circle-value">
            <CountUp value={Math.round(percent)} />%
          </span>
        )}
      </div>
    );
  }
);
