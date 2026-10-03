"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  setValue: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

/** RadioGroup — groep keuzerondjes met gedeelde naam en waarde. */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { value, defaultValue, onValueChange, name, disabled, orientation = "vertical", className, children, ...rest },
  ref
) {
  const autoName = React.useId();
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });

  return (
    <RadioGroupContext.Provider
      value={{ name: name ?? `lui-radio-${autoName}`, value: current, setValue: setCurrent, disabled }}
    >
      <div
        ref={ref}
        role="radiogroup"
        className={cn("lui-radio-group", `lui-radio-group-${orientation}`, className)}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Rendert de optie als een klikbare kaart. */
  card?: boolean;
}

/** Radio — één optie binnen een RadioGroup. */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, card, className, id, disabled, onChange, ...rest },
  ref
) {
  const group = React.useContext(RadioGroupContext);
  const autoId = React.useId();
  const inputId = id ?? `lui-radio-item-${autoId}`;
  const isDisabled = disabled ?? group?.disabled;
  const checked = group ? group.value === value : undefined;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "lui-radio-row",
        card && "lui-radio-card",
        checked && "lui-radio-checked",
        isDisabled && "lui-radio-disabled",
        className
      )}
    >
      <span className="lui-radio">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="lui-radio-input"
          name={group?.name}
          value={value}
          checked={checked}
          disabled={isDisabled}
          {...rest}
          // Ná {...rest}: een eigen onChange mag de groepskeuze niet stilzwijgend
          // overschrijven, anders selecteert de optie niet meer.
          onChange={(event) => {
            onChange?.(event);
            group?.setValue(value);
          }}
        />
        <span className="lui-radio-dot" aria-hidden="true" />
      </span>
      {(label || description) && (
        <span className="lui-radio-text">
          {label && <span className="lui-radio-label">{label}</span>}
          {description && <span className="lui-radio-description">{description}</span>}
        </span>
      )}
    </label>
  );
});
