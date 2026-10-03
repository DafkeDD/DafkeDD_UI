"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Breedte gedeeld door hoogte. 16 / 9 is breed, 1 is vierkant. */
  ratio?: number;
}

/**
 * AspectRatio — houdt een vaste verhouding aan, zodat een afbeelding of kaart
 * niet verspringt terwijl ze laadt.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = 16 / 9, className, style, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-aspect", className)}
      style={{ aspectRatio: String(ratio), ...style }}
      {...rest}
    />
  );
});
