import * as React from "react";
import { cn } from "../lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  /** Ronde variant, bv. voor avatar-placeholders. */
  circle?: boolean;
  /** Aantal regels; handig voor tekstblokken. */
  lines?: number;
}

/** Skeleton — laadplaceholder met shimmer. */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width, height = 14, circle, lines, className, style, ...rest },
  ref
) {
  if (lines && lines > 1) {
    return (
      <div ref={ref} className={cn("lui-skeleton-stack", className)} {...rest}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="lui-skeleton"
            style={{ height, width: index === lines - 1 ? "62%" : "100%" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("lui-skeleton", circle && "lui-skeleton-circle", className)}
      style={{ width: width ?? "100%", height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
});
