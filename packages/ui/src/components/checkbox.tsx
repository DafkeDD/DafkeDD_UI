"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useFieldContext } from "./field";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  /** Extra uitleg onder het label. */
  description?: React.ReactNode;
  /** Derde staat: gedeeltelijk aangevinkt. */
  indeterminate?: boolean;
  size?: "sm" | "md";
}

/** Checkbox — eigen vormgeving bovenop een echte <input type="checkbox">. */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate, size = "md", className, id, disabled, ...rest },
  ref
) {
  const context = useFieldContext();
  const autoId = React.useId();
  const inputId = id ?? context?.id ?? `lui-checkbox-${autoId}`;
  const inner = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (inner.current) inner.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const control = (
    <span className={cn("lui-checkbox", `lui-checkbox-${size}`)}>
      <input
        ref={(node) => {
          inner.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        id={inputId}
        type="checkbox"
        className="lui-checkbox-input"
        disabled={disabled ?? context?.disabled}
        {...rest}
      />
      <span className="lui-checkbox-box" aria-hidden="true">
        <Icon name={indeterminate ? "minus" : "check"} size={size === "sm" ? 11 : 13} strokeWidth={3} />
      </span>
    </span>
  );

  if (!label && !description) {
    return <span className={cn("lui-checkbox-standalone", className)}>{control}</span>;
  }

  return (
    <label
      className={cn("lui-checkbox-row", disabled && "lui-checkbox-row-disabled", className)}
      htmlFor={inputId}
    >
      {control}
      <span className="lui-checkbox-text">
        {label && <span className="lui-checkbox-label">{label}</span>}
        {description && <span className="lui-checkbox-description">{description}</span>}
      </span>
    </label>
  );
});
