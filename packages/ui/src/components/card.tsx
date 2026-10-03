"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hover-effect + cursor pointer (voor klikbare kaarten). */
  interactive?: boolean;
  /** Verwijdert de standaard binnenmarge (bv. als er een tabel in staat). */
  flush?: boolean;
}

/** Card — basiscontainer met surface, rand en schaduw. */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive, flush, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-card", interactive && "lui-card-interactive", flush && "lui-card-flush", className)}
      {...rest}
    />
  );
});

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-card-header", className)} {...rest} />;
  }
);

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...rest }, ref) {
    return <h3 ref={ref} className={cn("lui-card-title", className)} {...rest} />;
  }
);

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return <p ref={ref} className={cn("lui-card-description", className)} {...rest} />;
});

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-card-content", className)} {...rest} />;
  }
);

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-card-footer", className)} {...rest} />;
  }
);

/** Actiezone rechtsboven in een CardHeader. */
export const CardAction = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardAction({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-card-action", className)} {...rest} />;
  }
);
