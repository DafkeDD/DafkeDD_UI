"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Portal } from "../lib/portal";
import { useAnchorPosition } from "../lib/anchor";
import { useControllableState, useEscapeKey, useOutsideClick, usePresence } from "../lib/hooks";
import { useFieldProps } from "./field";
import { formatDuration, formatTime, parseTime, roundToStep, timeSlots } from "../lib/date";

export interface TimeFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "min" | "max" | "step"> {
  /** Tijd in minuten sinds middernacht (09:30 = 570). */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (minutes: number | null) => void;
  /** Stap in minuten voor pijltjestoetsen en suggesties. */
  step?: number;
  /** Vroegste toegestane tijd in minuten. */
  min?: number;
  /** Laatste toegestane tijd in minuten. */
  max?: number;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  /** Toont een lijst met tijdstippen bij focus. */
  suggestions?: boolean;
}

/**
 * TimeField — tijd invoeren zonder gedoe: "9", "930", "9.30" en "09:30"
 * worden alle vier begrepen en netjes geformatteerd bij het verlaten van het veld.
 */
export const TimeField = React.forwardRef<HTMLInputElement, TimeFieldProps>(function TimeField(
  {
    value,
    defaultValue = null,
    onValueChange,
    step = 15,
    min = 0,
    max = 23 * 60 + 59,
    size = "md",
    invalid,
    suggestions = true,
    className,
    placeholder = "09:00",
    onBlur,
    onFocus,
    onKeyDown,
    ...rest
  },
  ref
) {
  const [minutes, setMinutes] = useControllableState<number | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const [text, setText] = React.useState(() => (minutes == null ? "" : formatTime(minutes)));
  const [open, setOpen] = React.useState(false);

  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const field = useFieldProps({ invalid, disabled: rest.disabled }) as {
    id?: string;
    disabled?: boolean;
    invalid?: boolean;
    "aria-describedby"?: string;
  };

  const { render: zichtbaar, state: fase } = usePresence(open, listRef, 160);
  const position = useAnchorPosition(wrapRef, listRef, zichtbaar, {
    side: "bottom",
    align: "start",
    offset: 5,
    minWidth: true,
  });

  useEscapeKey(() => setOpen(false), open);
  useOutsideClick([wrapRef, listRef], () => setOpen(false), open);

  React.useEffect(() => {
    setText(minutes == null ? "" : formatTime(minutes));
  }, [minutes]);

  const commit = (raw: string) => {
    if (!raw.trim()) {
      setMinutes(null);
      setText("");
      return;
    }
    const parsed = parseTime(raw);
    if (parsed == null) {
      setText(minutes == null ? "" : formatTime(minutes));
      return;
    }
    const clamped = Math.min(Math.max(parsed, min), max);
    setMinutes(clamped);
    setText(formatTime(clamped));
  };

  const nudge = (direction: 1 | -1) => {
    const base = minutes ?? roundToStep(9 * 60, step);
    const next = Math.min(Math.max(roundToStep(base + direction * step, step), min), max);
    setMinutes(next);
    setText(formatTime(next));
  };

  const slots = React.useMemo(
    () => (suggestions ? timeSlots(roundToStep(min, step), max, step) : []),
    [suggestions, min, max, step]
  );

  const visibleSlots = React.useMemo(() => {
    const needle = text.replace(/\D/g, "");
    if (!needle) return slots;
    const filtered = slots.filter((slot) => formatTime(slot).replace(":", "").startsWith(needle));
    return filtered.length > 0 ? filtered : slots;
  }, [slots, text]);

  React.useEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector<HTMLElement>("[data-selected]");
    active?.scrollIntoView({ block: "center" });
  }, [open]);

  return (
    <div className={cn("lui-timefield", className)} ref={wrapRef}>
      <Icon name="clock" size={15} className="lui-timefield-icon" />
      <input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        id={field.id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-invalid={field.invalid || undefined}
        aria-describedby={field["aria-describedby"]}
        disabled={field.disabled}
        placeholder={placeholder}
        className={cn(
          "lui-timefield-input",
          `lui-timefield-${size}`,
          field.invalid && "lui-timefield-invalid"
        )}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onFocus={(event) => {
          onFocus?.(event);
          if (suggestions) setOpen(true);
          event.target.select();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          commit(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "ArrowUp") {
            event.preventDefault();
            nudge(1);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            nudge(-1);
          } else if (event.key === "Enter") {
            event.preventDefault();
            commit((event.target as HTMLInputElement).value);
            setOpen(false);
          } else if (event.key === "Tab") {
            setOpen(false);
          }
        }}
        {...rest}
      />

      {zichtbaar && visibleSlots.length > 0 && (
        <Portal>
          <div
            ref={listRef}
            role="listbox"
            className="lui-timefield-list" data-state={fase} data-side={position.side}
            style={{ ...position.style, opacity: position.ready ? 1 : 0 }}
          >
            {visibleSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                role="option"
                aria-selected={slot === minutes}
                data-selected={slot === minutes ? "" : undefined}
                className="lui-timefield-option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setMinutes(slot);
                  setText(formatTime(slot));
                  setOpen(false);
                  inputRef.current?.blur();
                }}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
});

export interface TimeRangeValue {
  start: number | null;
  end: number | null;
}

export interface TimeRangeFieldProps {
  value?: TimeRangeValue;
  defaultValue?: TimeRangeValue;
  onValueChange?: (value: TimeRangeValue) => void;
  step?: number;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  /** Toont de duur rechts van de velden, bv. "7 u 30". */
  showDuration?: boolean;
}

/** TimeRangeField — begin- en eindtijd naast elkaar, met bewaking van de volgorde. */
export const TimeRangeField = React.forwardRef<HTMLDivElement, TimeRangeFieldProps>(
  function TimeRangeField(
    {
      value,
      defaultValue = { start: null, end: null },
      onValueChange,
      step = 15,
      min,
      max,
      size = "md",
      invalid,
      disabled,
      className,
      showDuration = true,
    },
    ref
  ) {
    const [range, setRange] = useControllableState<TimeRangeValue>({
      value,
      defaultValue,
      onChange: onValueChange,
    });

    const duration =
      range.start != null && range.end != null && range.end > range.start
        ? range.end - range.start
        : null;

    return (
      <div ref={ref} className={cn("lui-timerange", className)}>
        <TimeField
          value={range.start}
          onValueChange={(start) => {
            const end = range.end != null && start != null && range.end <= start ? start + step : range.end;
            setRange({ start, end });
          }}
          step={step}
          min={min}
          max={max}
          size={size}
          invalid={invalid}
          disabled={disabled}
          placeholder="Van"
          aria-label="Begintijd"
        />
        <span className="lui-timerange-sep" aria-hidden="true">
          –
        </span>
        <TimeField
          value={range.end}
          onValueChange={(end) => setRange({ ...range, end })}
          step={step}
          min={range.start != null ? range.start + step : min}
          max={max}
          size={size}
          invalid={invalid}
          disabled={disabled}
          placeholder="Tot"
          aria-label="Eindtijd"
        />
        {showDuration && duration != null && (
          <span className="lui-timerange-duration">{formatDuration(duration)}</span>
        )}
      </div>
    );
  }
);

