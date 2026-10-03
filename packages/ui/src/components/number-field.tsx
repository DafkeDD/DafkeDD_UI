"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";
import { useFieldProps } from "./field";

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "prefix" | "step" | "min" | "max"> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Grotere stap met PageUp en PageDown. */
  largeStep?: number;
  size?: "sm" | "md" | "lg";
  /** Opmaak van het getal, bv. { style: "currency", currency: "EUR" }. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  /** Tekst of icoon links in het veld. */
  prefix?: React.ReactNode;
  /** Eenheid rechts van het getal, bv. "kg". */
  unit?: React.ReactNode;
  invalid?: boolean;
  /** Knoppen verbergen en alleen typen en pijltjestoetsen toelaten. */
  hideSteppers?: boolean;
}

/**
 * NumberField — numeriek veld met plus- en minknoppen, grenzen en opmaak.
 * Pijltjes stappen met `step`, PageUp en PageDown met `largeStep`, Home en End
 * springen naar het minimum en maximum.
 */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      value,
      defaultValue = null,
      onValueChange,
      min,
      max,
      step = 1,
      largeStep,
      size = "md",
      format,
      locale = "nl-BE",
      prefix,
      unit,
      invalid,
      hideSteppers,
      disabled,
      className,
      ...props
    },
    ref
  ) {
    const merged = useFieldProps(props as Parameters<typeof useFieldProps>[0]) as typeof props & {
      invalid?: boolean;
    };
    const { invalid: veldFout, ...rest } = merged;
    const fout = invalid ?? veldFout;

    const [getal, setGetal] = useControllableState<number | null>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const [tekst, setTekst] = React.useState<string>(() => (getal === null ? "" : String(getal)));
    const [bezigMetTypen, setBezigMetTypen] = React.useState(false);

    const formatter = React.useMemo(
      () => (format ? new Intl.NumberFormat(locale, format) : null),
      [format, locale]
    );

    React.useEffect(() => {
      if (bezigMetTypen) return;
      setTekst(getal === null ? "" : formatter ? formatter.format(getal) : String(getal));
    }, [getal, formatter, bezigMetTypen]);

    const klem = (waarde: number) => {
      let volgende = waarde;
      if (min !== undefined) volgende = Math.max(min, volgende);
      if (max !== undefined) volgende = Math.min(max, volgende);
      // Zwevende-kommaruis na optellen wegwerken, bv. 0.1 + 0.2.
      const cijfers = (String(step).split(".")[1] ?? "").length;
      return cijfers ? Number(volgende.toFixed(cijfers)) : volgende;
    };

    const stap = (richting: 1 | -1, grootte = step) => {
      const basis = getal ?? min ?? 0;
      setGetal(klem(basis + richting * grootte));
    };

    const uitTekst = (invoer: string) => {
      const schoon = invoer.replace(/\s/g, "").replace(",", ".").replace(/[^\d.-]/g, "");
      if (schoon === "" || schoon === "-") return null;
      const waarde = Number(schoon);
      return Number.isNaN(waarde) ? null : waarde;
    };

    const opToets = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        stap(1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        stap(-1);
      } else if (event.key === "PageUp") {
        event.preventDefault();
        stap(1, largeStep ?? step * 10);
      } else if (event.key === "PageDown") {
        event.preventDefault();
        stap(-1, largeStep ?? step * 10);
      } else if (event.key === "Home" && min !== undefined) {
        event.preventDefault();
        setGetal(min);
      } else if (event.key === "End" && max !== undefined) {
        event.preventDefault();
        setGetal(max);
      }
    };

    const opMin = min !== undefined && getal !== null && getal <= min;
    const opMax = max !== undefined && getal !== null && getal >= max;

    return (
      <div
        className={cn("lui-numfield", `lui-numfield-${size}`, fout && "lui-numfield-invalid", className)}
        data-disabled={disabled ? "" : undefined}
      >
        {prefix && <span className="lui-numfield-prefix">{prefix}</span>}
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          role="spinbutton"
          aria-valuenow={getal ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-invalid={fout || undefined}
          disabled={disabled}
          className="lui-numfield-input"
          value={tekst}
          onKeyDown={opToets}
          onFocus={() => setBezigMetTypen(true)}
          onChange={(event) => {
            setTekst(event.target.value);
            setGetal(uitTekst(event.target.value));
          }}
          onBlur={(event) => {
            setBezigMetTypen(false);
            const waarde = uitTekst(event.target.value);
            setGetal(waarde === null ? null : klem(waarde));
            rest.onBlur?.(event);
          }}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {unit && <span className="lui-numfield-unit">{unit}</span>}

        {!hideSteppers && (
          <span className="lui-numfield-steppers">
            <button
              type="button"
              tabIndex={-1}
              aria-label="Meer"
              disabled={disabled || opMax}
              onClick={() => stap(1)}
            >
              <Icon name="chevronUp" size={13} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Minder"
              disabled={disabled || opMin}
              onClick={() => stap(-1)}
            >
              <Icon name="chevronDown" size={13} strokeWidth={2.5} />
            </button>
          </span>
        )}
      </div>
    );
  }
);
