"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar, type CalendarProps } from "./calendar";
import { useControllableState } from "../lib/hooks";
import { useFieldProps } from "./field";
import {
  DEFAULT_LOCALE,
  type DateRange,
  formatDate,
  formatDateRange,
} from "../lib/date";

type CalendarOptions = Pick<
  CalendarProps & { mode?: never },
  "min" | "max" | "disabled" | "weekStartsOn" | "showWeekNumbers" | "markers" | "locale"
>;

export interface DatePickerProps extends CalendarOptions {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  placeholder?: string;
  /** Opmaak van de getoonde datum. */
  format?: Intl.DateTimeFormatOptions;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabledInput?: boolean;
  /** Toont een wisknop wanneer er een datum gekozen is. */
  clearable?: boolean;
  /** Knop "Vandaag" onderaan de kalender. */
  showToday?: boolean;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
}

/** DatePicker — invoerveld met kalender in een popover. */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue = null,
    onValueChange,
    placeholder = "Kies een datum",
    format = { day: "2-digit", month: "long", year: "numeric" },
    size = "md",
    invalid,
    disabledInput,
    clearable,
    showToday = true,
    locale = DEFAULT_LOCALE,
    className,
    id,
    ...calendarOptions
  },
  ref
) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const field = useFieldProps({ id, disabled: disabledInput, invalid }) as {
    id?: string;
    disabled?: boolean;
    invalid?: boolean;
    "aria-describedby"?: string;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          id={field.id}
          disabled={field.disabled}
          aria-invalid={field.invalid || undefined}
          aria-describedby={field["aria-describedby"]}
          data-state={open ? "open" : "closed"}
          className={cn(
            "lui-datefield",
            `lui-datefield-${size}`,
            field.invalid && "lui-datefield-invalid",
            className
          )}
        >
          <Icon name="calendar" size={16} className="lui-datefield-icon" />
          <span className={cn("lui-datefield-value", !date && "lui-datefield-placeholder")}>
            {date ? formatDate(date, format, locale) : placeholder}
          </span>
          {clearable && date && !field.disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Datum wissen"
              className="lui-datefield-clear"
              onClick={(event) => {
                event.stopPropagation();
                setDate(null);
              }}
            >
              <Icon name="x" size={14} />
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" flush className="lui-datefield-popover">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date ?? undefined}
          locale={locale}
          onSelect={(next) => {
            setDate(next);
            if (next) setOpen(false);
          }}
          footer={
            showToday ? (
              <button
                type="button"
                className="lui-datefield-today"
                onClick={() => {
                  setDate(new Date());
                  setOpen(false);
                }}
              >
                Vandaag
              </button>
            ) : undefined
          }
          {...calendarOptions}
        />
      </PopoverContent>
    </Popover>
  );
});

export interface DateRangePickerProps extends CalendarOptions {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  disabledInput?: boolean;
  clearable?: boolean;
  /** Aantal maanden naast elkaar in de popover. */
  numberOfMonths?: number;
  /** Snelkeuzes links van de kalender, bv. "Deze week". */
  presets?: Array<{ label: string; range: DateRange }>;
  id?: string;
  className?: string;
}

/** DateRangePicker — periode kiezen (van – tot) in één popover. */
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue = null,
      onValueChange,
      placeholder = "Kies een periode",
      size = "md",
      invalid,
      disabledInput,
      clearable,
      numberOfMonths = 2,
      presets,
      locale = DEFAULT_LOCALE,
      className,
      id,
      ...calendarOptions
    },
    ref
  ) {
    const [open, setOpen] = React.useState(false);
    const [range, setRange] = useControllableState<DateRange | null>({
      value,
      defaultValue,
      onChange: (next) => onValueChange?.(next ?? {}),
    });

    const label = range?.from ? formatDateRange(range, locale) : placeholder;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            id={id}
            disabled={disabledInput}
            aria-invalid={invalid || undefined}
            data-state={open ? "open" : "closed"}
            className={cn(
              "lui-datefield",
              `lui-datefield-${size}`,
              invalid && "lui-datefield-invalid",
              className
            )}
          >
            <Icon name="calendar" size={16} className="lui-datefield-icon" />
            <span className={cn("lui-datefield-value", !range?.from && "lui-datefield-placeholder")}>
              {label}
            </span>
            {clearable && range?.from && !disabledInput && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Periode wissen"
                className="lui-datefield-clear"
                onClick={(event) => {
                  event.stopPropagation();
                  setRange({});
                }}
              >
                <Icon name="x" size={14} />
              </span>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" flush className="lui-datefield-popover">
          <div className="lui-daterange">
            {presets && presets.length > 0 && (
              <div className="lui-daterange-presets">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className="lui-daterange-preset"
                    onClick={() => {
                      setRange(preset.range);
                      setOpen(false);
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
            <Calendar
              mode="range"
              selected={range}
              numberOfMonths={numberOfMonths}
              defaultMonth={range?.from ?? undefined}
              locale={locale}
              onSelect={(next) => {
                setRange(next);
                if (next.from && next.to) setOpen(false);
              }}
              {...calendarOptions}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
