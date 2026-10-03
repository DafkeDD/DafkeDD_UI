"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

export interface OtpInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Wordt aangeroepen zodra alle vakjes ingevuld zijn. */
  onComplete?: (value: string) => void;
  /** Toont de vakjes in foutstatus (met schud-animatie). */
  invalid?: boolean;
  disabled?: boolean;
  /** Alleen cijfers toestaan. */
  numeric?: boolean;
  autoFocus?: boolean;
}

/** OtpInput — invoer van een verificatiecode, één teken per vakje. */
export const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(function OtpInput(
  {
    length = 6,
    value,
    defaultValue = "",
    onValueChange,
    onComplete,
    invalid,
    disabled,
    numeric = true,
    autoFocus,
    className,
    ...rest
  },
  ref
) {
  const [code, setCode] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);

  React.useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const update = (next: string) => {
    const clean = next.slice(0, length);
    setCode(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const onChange = (index: number, raw: string) => {
    const char = numeric ? raw.replace(/\D/g, "") : raw;
    if (!char) return;
    const chars = code.split("");
    for (let offset = 0; offset < char.length && index + offset < length; offset += 1) {
      chars[index + offset] = char[offset];
    }
    const next = chars.join("").slice(0, length);
    update(next);
    const focusIndex = Math.min(index + char.length, length - 1);
    inputs.current[focusIndex]?.focus();
  };

  const onKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const chars = code.split("");
      if (chars[index]) {
        chars[index] = "";
        update(chars.join(""));
      } else if (index > 0) {
        chars[index - 1] = "";
        update(chars.join(""));
        inputs.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  return (
    <div ref={ref} className={cn("lui-otp", invalid && "lui-otp-invalid", className)} {...rest}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputs.current[index] = node;
          }}
          className="lui-otp-box"
          inputMode={numeric ? "numeric" : "text"}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          disabled={disabled}
          aria-label={`Teken ${index + 1} van ${length}`}
          value={code[index] ?? ""}
          onChange={(event) => onChange(index, event.target.value)}
          onKeyDown={(event) => onKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text");
            onChange(0, numeric ? pasted.replace(/\D/g, "") : pasted);
          }}
          onFocus={(event) => event.target.select()}
        />
      ))}
    </div>
  );
});
