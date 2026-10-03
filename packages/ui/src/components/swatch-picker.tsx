"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

export interface SwatchPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Kleuren om uit te kiezen; elke geldige CSS-kleur mag. */
  colors: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (color: string) => void;
  size?: number;
  /** Vierkant met afgeronde hoeken in plaats van rond. */
  square?: boolean;
  /** Toont een eigen-kleurknop met de systeemkiezer. */
  allowCustom?: boolean;
  label?: string;
}

/** SwatchPicker — kleur kiezen uit een rij stalen, bv. een lijst- of accentkleur. */
export const SwatchPicker = React.forwardRef<HTMLDivElement, SwatchPickerProps>(
  function SwatchPicker(
    { colors, value, defaultValue, onValueChange, size = 28, square, allowCustom, label = "Kleur", className, ...rest },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? colors[0] ?? "",
      onChange: onValueChange,
    });

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        className={cn("lui-swatches", className)}
        {...rest}
      >
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={current === color}
            aria-label={color}
            title={color}
            className={cn("lui-swatch", square && "lui-swatch-square")}
            style={{ width: size, height: size, background: color }}
            onClick={() => setCurrent(color)}
          >
            {current === color && <Icon name="check" size={Math.max(12, size * 0.5)} strokeWidth={3} />}
          </button>
        ))}

        {allowCustom && (
          <label
            className={cn("lui-swatch", "lui-swatch-custom", square && "lui-swatch-square")}
            style={{ width: size, height: size }}
            title="Eigen kleur"
          >
            <Icon name="plus" size={Math.max(12, size * 0.45)} />
            <input
              type="color"
              className="lui-sr-only"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </label>
        )}
      </div>
    );
  }
);
