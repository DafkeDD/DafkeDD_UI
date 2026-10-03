"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface PulseDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "green" | "amber" | "red" | "accent" | "blue" | "neutral";
  size?: number;
  /** Zet de kloppende animatie uit; de halo blijft. */
  still?: boolean;
  label?: string;
}

/** PulseDot — statusbolletje met halo, voor "live", "bezet" of "online". */
export const PulseDot = React.forwardRef<HTMLSpanElement, PulseDotProps>(function PulseDot(
  { tone = "green", size = 9, still, label, className, style, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      role={label ? "status" : undefined}
      aria-label={label}
      className={cn("lui-pulse", `lui-pulse-${tone}`, still && "lui-pulse-still", className)}
      style={{ width: size, height: size, ...style }}
      {...rest}
    />
  );
});
