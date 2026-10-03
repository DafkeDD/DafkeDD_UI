"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useFieldProps } from "./field";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  size?: "sm" | "md" | "lg";
  /** Icoon of tekst links in het veld. */
  prefix?: React.ReactNode;
  /** Icoon of knop rechts in het veld. */
  suffix?: React.ReactNode;
  /** Vaste tekst tegen het veld aan, bv. ".dafke.be". */
  addon?: React.ReactNode;
  invalid?: boolean;
}

/** Input — tekstveld met optionele iconen, addon en foutstatus. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", prefix, suffix, addon, invalid, className, ...props },
  ref
) {
  const merged = useFieldProps(props as Parameters<typeof useFieldProps>[0]) as InputProps;
  const { invalid: isInvalid, ...rest } = { ...merged, invalid: invalid ?? (merged as InputProps).invalid };

  const input = (
    <input
      ref={ref}
      className={cn(
        "lui-input",
        `lui-input-${size}`,
        prefix && "lui-input-has-prefix",
        suffix && "lui-input-has-suffix",
        isInvalid && "lui-input-invalid",
        !prefix && !suffix && !addon && className
      )}
      aria-invalid={isInvalid || undefined}
      {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  );

  if (!prefix && !suffix && !addon) return input;

  return (
    <div
      className={cn(
        "lui-input-wrap",
        `lui-input-wrap-${size}`,
        isInvalid && "lui-input-wrap-invalid",
        className
      )}
    >
      {prefix && <span className="lui-input-affix lui-input-prefix">{prefix}</span>}
      {input}
      {suffix && <span className="lui-input-affix lui-input-suffix">{suffix}</span>}
      {addon && <span className="lui-input-addon">{addon}</span>}
    </div>
  );
});
