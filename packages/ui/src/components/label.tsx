"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Toont een rood sterretje. */
  required?: boolean;
}

/** Label — bijschrift voor een formulierveld. */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { required, className, children, ...rest },
  ref
) {
  return (
    <label ref={ref} className={cn("lui-label", className)} {...rest}>
      {children}
      {required && (
        <span className="lui-label-required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});
