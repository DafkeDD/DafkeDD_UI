"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Label } from "./label";

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  disabled: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** Geeft de omliggende Field-context terug (id, aria-koppelingen, foutstatus). */
export function useFieldContext() {
  return React.useContext(FieldContext);
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "id"> {
  label?: React.ReactNode;
  /** Uitleg onder het veld. */
  hint?: React.ReactNode;
  /** Foutmelding; zet het veld automatisch in foutstatus. */
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Extra element rechts van het label (bv. een Badge of "optioneel"). */
  labelAction?: React.ReactNode;
  id?: string;
  /** Horizontale layout: label links, veld rechts. */
  orientation?: "vertical" | "horizontal";
  /**
   * Zwevend label: het label staat in het veld en klimt naar de rand zodra er
   * focus of inhoud is. Werkt met Input, Textarea, Select en PhoneInput.
   */
  floating?: boolean;
  /** Bij een zwevend label: of er al iets ingevuld staat. */
  filled?: boolean;
}

/**
 * Field — koppelt label, hint en foutmelding aan één invoerelement.
 * Kinderen krijgen automatisch `id`, `aria-describedby` en `aria-invalid`.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    hint,
    error,
    required,
    disabled,
    labelAction,
    id,
    orientation = "vertical",
    floating,
    filled,
    className,
    children,
    ...rest
  },
  ref
) {
  const autoId = React.useId();
  const fieldId = id ?? `lui-field-${autoId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const context: FieldContextValue = {
    id: fieldId,
    describedBy,
    invalid: Boolean(error),
    disabled: Boolean(disabled),
  };

  return (
    <FieldContext.Provider value={context}>
      <div
        ref={ref}
        className={cn(
          "lui-field",
          `lui-field-${orientation}`,
          floating && "lui-field-floating",
          disabled && "lui-field-disabled",
          className
        )}
        data-filled={filled ? "" : undefined}
        {...rest}
      >
        {floating ? (
          <div className="lui-field-control">
            {children}
            {label && (
              <Label htmlFor={fieldId} required={required} className="lui-field-floatlabel">
                {label}
              </Label>
            )}
            {error && (
              <span className="lui-field-error" id={errorId} role="alert">
                {error}
              </span>
            )}
            {hint && !error && (
              <span className="lui-field-hint" id={hintId}>
                {hint}
              </span>
            )}
          </div>
        ) : (
          <>
        {(label || labelAction) && (
          <div className="lui-field-labelrow">
            {label && (
              <Label htmlFor={fieldId} required={required}>
                {label}
              </Label>
            )}
            {labelAction && <span className="lui-field-labelaction">{labelAction}</span>}
          </div>
        )}
        <div className="lui-field-control">
          {children}
          {error && (
            <span className="lui-field-error" id={errorId} role="alert">
              {error}
            </span>
          )}
          {hint && !error && (
            <span className="lui-field-hint" id={hintId}>
              {hint}
            </span>
          )}
        </div>
          </>
        )}
      </div>
    </FieldContext.Provider>
  );
});

/** Zet Field-context om naar props voor een invoerelement. */
export function useFieldProps(props: {
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
}) {
  const context = useFieldContext();
  if (!context) return props;
  return {
    ...props,
    id: props.id ?? context.id,
    disabled: props.disabled ?? context.disabled,
    invalid: props.invalid ?? context.invalid,
    "aria-describedby": props["aria-describedby"] ?? context.describedBy,
  };
}
