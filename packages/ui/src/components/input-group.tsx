"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maat van de gekoppelde onderdelen. */
  size?: "sm" | "md" | "lg";
  /** Onder elkaar in plaats van naast elkaar. */
  vertical?: boolean;
  /** Volle breedte. */
  block?: boolean;
  /** Rode rand rond de hele groep. */
  invalid?: boolean;
}

export interface InputGroupTextProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * InputGroup — plakt velden, selects, knoppen en vaste teksten aan elkaar tot
 * één controle: de ronde hoeken blijven alleen aan de buitenkant staan en de
 * randen ertussen vallen weg.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { size = "md", vertical, block, invalid, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      role="group"
      data-size={size}
      data-vertical={vertical ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      className={cn("lui-inputgroup", block && "lui-inputgroup-block", className)}
      {...rest}
    />
  );
});

/** Vaste tekst of icoon binnen de groep, bv. "https://" of "€". */
export const InputGroupText = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(
  function InputGroupText({ className, ...rest }, ref) {
    return <span ref={ref} className={cn("lui-inputgroup-text", className)} {...rest} />;
  }
);
