import * as React from "react";
import { cn } from "../lib/cn";

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  /** Toegankelijk label; laat leeg voor decoratief gebruik. */
  label?: string;
}

/** Spinner — laadindicator die de accentkleur van het thema erft. */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size = 16, label, className, ...rest },
  ref
) {
  return (
    <svg
      ref={ref}
      className={cn("lui-spinner", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      <circle className="lui-spinner-track" cx="12" cy="12" r="9" strokeWidth="2.5" />
      <path className="lui-spinner-head" d="M21 12a9 9 0 00-9-9" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
});
