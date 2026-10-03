"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import {
  DEFAULT_LOCALE,
  type DateRange,
  addDays,
  addMonths,
  clampDate,
  endOfWeek,
  formatDate,
  getISOWeek,
  getMonthGrid,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  isWithin,
  monthName,
  startOfDay,
  startOfMonth,
  startOfWeek,
  weekdayNames,
} from "../lib/date";

export type CalendarMode = "single" | "range" | "multiple";

/**
 * De props die elke modus deelt. Geëxporteerd omdat de props-tabel in de docs
 * uit `export interface` gelezen wordt: `CalendarProps` zelf is een doorsnede
 * met een union en komt daar dus niet in terecht.
 */
export interface CalendarBaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Zichtbare maand (controlled). */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** 0 = zondag, 1 = maandag (standaard). */
  weekStartsOn?: 0 | 1;
  /** Aantal maanden naast elkaar. */
  numberOfMonths?: number;
  min?: Date;
  max?: Date;
  /** Extra dagen uitschakelen, bv. feestdagen of weekends. */
  disabled?: (date: Date) => boolean;
  /** Toont de ISO-weeknummers in een extra kolom. */
  showWeekNumbers?: boolean;
  /** Verbergt de dagen van de vorige/volgende maand. */
  hideOutsideDays?: boolean;
  /** Klein bolletje onder een dag, bv. "er staat iets gepland". */
  markers?: (date: Date) => boolean;
  locale?: string;
  /** Inhoud onderaan de kalender, bv. knoppen. */
  footer?: React.ReactNode;
  size?: "sm" | "md";
}

/** Eén datum kiezen (de standaard). */
export interface CalendarSingleProps {
  mode?: "single";
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
}

/** Een periode kiezen: eerste klik zet `from`, tweede `to`. */
export interface CalendarRangeProps {
  mode: "range";
  selected?: DateRange | null;
  onSelect?: (range: DateRange) => void;
}

/** Losse dagen aan- en uitvinken. */
export interface CalendarMultipleProps {
  mode: "multiple";
  selected?: Date[];
  onSelect?: (dates: Date[]) => void;
}

export type CalendarProps = CalendarBaseProps &
  (CalendarSingleProps | CalendarRangeProps | CalendarMultipleProps);

/**
 * Calendar — maandkalender met enkelvoudige, bereik- en meervoudige selectie.
 * Volledig zelf geschreven: geen react-day-picker, geen date-bibliotheek.
 */
export const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    month,
    defaultMonth,
    onMonthChange,
    weekStartsOn = 1,
    numberOfMonths = 1,
    min,
    max,
    disabled,
    showWeekNumbers,
    hideOutsideDays,
    markers,
    locale = DEFAULT_LOCALE,
    footer,
    size = "md",
    className,
    mode = "single",
    selected,
    onSelect,
    ...rest
  } = props as CalendarBaseProps & {
    mode?: CalendarMode;
    selected?: Date | Date[] | DateRange | null;
    onSelect?: (value: never) => void;
  };

  const anchor = React.useMemo(() => firstSelected(mode, selected) ?? new Date(), [mode, selected]);
  const [internalMonth, setInternalMonth] = React.useState<Date>(() =>
    startOfMonth(defaultMonth ?? anchor)
  );
  const visibleMonth = month ? startOfMonth(month) : internalMonth;

  const [focused, setFocused] = React.useState<Date | null>(null);
  const [hovered, setHovered] = React.useState<Date | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const setMonth = (next: Date) => {
    const value = startOfMonth(next);
    if (!month) setInternalMonth(value);
    onMonthChange?.(value);
  };

  const isDisabled = React.useCallback(
    (date: Date) => {
      if (min && isBeforeDay(date, min)) return true;
      if (max && isAfterDay(date, max)) return true;
      return Boolean(disabled?.(date));
    },
    [min, max, disabled]
  );

  const pick = (date: Date) => {
    if (isDisabled(date)) return;
    const day = startOfDay(date);

    if (mode === "range") {
      const current = (selected ?? {}) as DateRange;
      const next: DateRange =
        !current.from || (current.from && current.to)
          ? { from: day, to: undefined }
          : isBeforeDay(day, current.from)
            ? { from: day, to: current.from }
            : { from: current.from, to: day };
      (onSelect as unknown as (value: DateRange) => void)?.(next);
      return;
    }

    if (mode === "multiple") {
      const current = ((selected as Date[]) ?? []).slice();
      const index = current.findIndex((entry) => isSameDay(entry, day));
      if (index === -1) current.push(day);
      else current.splice(index, 1);
      (onSelect as unknown as (value: Date[]) => void)?.(current);
      return;
    }

    const current = selected as Date | null | undefined;
    (onSelect as unknown as (value: Date | null) => void)?.(
      current && isSameDay(current, day) ? null : day
    );
  };

  const moveFocus = (base: Date, next: Date) => {
    const target = clampDate(next, min, max);
    setFocused(target);
    if (!isSameMonth(target, visibleMonth) && !isWithinVisible(target, visibleMonth, numberOfMonths)) {
      setMonth(startOfMonth(target));
    }
    window.setTimeout(() => {
      gridRef.current
        ?.querySelector<HTMLButtonElement>(`[data-day="${dayKey(target)}"]`)
        ?.focus({ preventScroll: true });
    }, 0);
    return base;
  };

  const onKeyDown = (event: React.KeyboardEvent, date: Date) => {
    const keys: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, -1),
      ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => startOfWeek(date, weekStartsOn),
      End: () => endOfWeek(date, weekStartsOn),
      PageUp: () => addMonths(date, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(date, event.shiftKey ? 12 : 1),
    };

    const handler = keys[event.key];
    if (handler) {
      event.preventDefault();
      moveFocus(date, handler());
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pick(date);
    }
  };

  const months = Array.from({ length: Math.max(1, numberOfMonths) }, (_, index) =>
    addMonths(visibleMonth, index)
  );
  const weekdays = weekdayNames(weekStartsOn, "short", locale);

  const canGoBack = !min || isBeforeDay(startOfMonth(visibleMonth), min) === false;
  const canGoForward =
    !max || isAfterDay(startOfMonth(addMonths(visibleMonth, months.length)), max) === false;

  return (
    <div
      ref={ref}
      className={cn("lui-calendar", `lui-calendar-${size}`, className)}
      role="group"
      aria-label="Kalender"
      {...rest}
    >
      <div className="lui-calendar-months" ref={gridRef}>
        {months.map((current, monthIndex) => (
          <div className="lui-calendar-month" key={current.toISOString()}>
            <div className="lui-calendar-header">
              {monthIndex === 0 ? (
                <button
                  type="button"
                  className="lui-calendar-nav"
                  aria-label="Vorige maand"
                  disabled={!canGoBack}
                  onClick={() => setMonth(addMonths(visibleMonth, -1))}
                >
                  <Icon name="chevronLeft" size={16} />
                </button>
              ) : (
                <span className="lui-calendar-nav-spacer" />
              )}

              <div className="lui-calendar-title" aria-live="polite">
                {monthName(current, locale)}
              </div>

              {monthIndex === months.length - 1 ? (
                <button
                  type="button"
                  className="lui-calendar-nav"
                  aria-label="Volgende maand"
                  disabled={!canGoForward}
                  onClick={() => setMonth(addMonths(visibleMonth, 1))}
                >
                  <Icon name="chevronRight" size={16} />
                </button>
              ) : (
                <span className="lui-calendar-nav-spacer" />
              )}
            </div>

            <div
              className={cn("lui-calendar-grid", showWeekNumbers && "lui-calendar-grid-weeks")}
              role="grid"
            >
              {showWeekNumbers && <div className="lui-calendar-weekhead" aria-hidden="true" />}
              {weekdays.map((day) => (
                <div className="lui-calendar-weekday" key={day} role="columnheader" aria-label={day}>
                  {day}
                </div>
              ))}

              {chunk(getMonthGrid(current, weekStartsOn), 7).map((week) => (
                <React.Fragment key={week[0].toISOString()}>
                  {showWeekNumbers && (
                    <div className="lui-calendar-weeknumber" aria-hidden="true">
                      {getISOWeek(week[0])}
                    </div>
                  )}
                  {week.map((date) => {
                    const outside = !isSameMonth(date, current);
                    if (outside && hideOutsideDays) {
                      return <div className="lui-calendar-day-empty" key={dayKey(date)} />;
                    }

                    const state = dayState(mode, selected, date, hovered);
                    const dayDisabled = isDisabled(date);
                    const isFocusTarget = focused
                      ? isSameDay(focused, date)
                      : state.selected || (!hasSelection(mode, selected) && isToday(date));

                    return (
                      <button
                        key={dayKey(date)}
                        type="button"
                        role="gridcell"
                        data-day={dayKey(date)}
                        tabIndex={isFocusTarget ? 0 : -1}
                        disabled={dayDisabled}
                        aria-selected={state.selected}
                        aria-current={isToday(date) ? "date" : undefined}
                        aria-label={formatDate(date, { dateStyle: "full" }, locale)}
                        data-outside={outside ? "" : undefined}
                        data-today={isToday(date) ? "" : undefined}
                        data-weekend={isWeekend(date) ? "" : undefined}
                        data-selected={state.selected ? "" : undefined}
                        data-range-start={state.rangeStart ? "" : undefined}
                        data-range-end={state.rangeEnd ? "" : undefined}
                        data-in-range={state.inRange ? "" : undefined}
                        className="lui-calendar-day"
                        onClick={() => pick(date)}
                        onFocus={() => setFocused(date)}
                        onMouseEnter={() => setHovered(date)}
                        onMouseLeave={() => setHovered(null)}
                        onKeyDown={(event) => onKeyDown(event, date)}
                      >
                        <span className="lui-calendar-day-label">{date.getDate()}</span>
                        {markers?.(date) && <span className="lui-calendar-marker" />}
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {footer && <div className="lui-calendar-footer">{footer}</div>}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Hulpfuncties                                                        */
/* ------------------------------------------------------------------ */

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function firstSelected(
  mode: CalendarMode,
  selected: Date | Date[] | DateRange | null | undefined
): Date | null {
  if (!selected) return null;
  if (mode === "range") return (selected as DateRange).from ?? null;
  if (mode === "multiple") return (selected as Date[])[0] ?? null;
  return selected as Date;
}

function hasSelection(
  mode: CalendarMode,
  selected: Date | Date[] | DateRange | null | undefined
): boolean {
  if (!selected) return false;
  if (mode === "range") return Boolean((selected as DateRange).from);
  if (mode === "multiple") return (selected as Date[]).length > 0;
  return true;
}

function isWithinVisible(date: Date, month: Date, count: number): boolean {
  for (let index = 0; index < count; index += 1) {
    if (isSameMonth(date, addMonths(month, index))) return true;
  }
  return false;
}

function dayState(
  mode: CalendarMode,
  selected: Date | Date[] | DateRange | null | undefined,
  date: Date,
  hovered: Date | null
) {
  if (mode === "range") {
    const range = (selected ?? {}) as DateRange;
    const to = range.to ?? (range.from && hovered ? hovered : undefined);
    const start = range.from && to && isBeforeDay(to, range.from) ? to : range.from;
    const end = range.from && to && isBeforeDay(to, range.from) ? range.from : to;

    return {
      selected: isSameDay(date, range.from) || isSameDay(date, range.to),
      rangeStart: isSameDay(date, start),
      rangeEnd: isSameDay(date, end),
      inRange: isWithin(date, start, end),
    };
  }

  if (mode === "multiple") {
    const dates = (selected as Date[]) ?? [];
    return {
      selected: dates.some((entry) => isSameDay(entry, date)),
      rangeStart: false,
      rangeEnd: false,
      inRange: false,
    };
  }

  return {
    selected: isSameDay(selected as Date | null | undefined, date),
    rangeStart: false,
    rangeEnd: false,
    inRange: false,
  };
}
