/**
 * Datumhulpfuncties — eigen implementatie op basis van de ingebouwde Date en
 * Intl. Geen date-fns, geen dayjs, geen luxon.
 *
 * Alle functies werken met lokale tijd en laten de meegegeven Date ongemoeid.
 */

export interface DateRange {
  from?: Date;
  to?: Date;
}

/** Standaardtaal van het Dafke UI-design. */
export const DEFAULT_LOCALE = "nl-BE";

/* ------------------------------------------------------------------ */
/* Basis                                                               */
/* ------------------------------------------------------------------ */

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function addMonths(date: Date, amount: number): Date {
  const copy = new Date(date);
  const day = copy.getDate();
  copy.setDate(1);
  copy.setMonth(copy.getMonth() + amount);
  copy.setDate(Math.min(day, daysInMonth(copy)));
  return copy;
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/** weekStartsOn: 0 = zondag, 1 = maandag (standaard in België). */
export function startOfWeek(date: Date, weekStartsOn = 1): Date {
  const copy = startOfDay(date);
  const diff = (copy.getDay() - weekStartsOn + 7) % 7;
  return addDays(copy, -diff);
}

export function endOfWeek(date: Date, weekStartsOn = 1): Date {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

/* ------------------------------------------------------------------ */
/* Vergelijken                                                         */
/* ------------------------------------------------------------------ */

export function isSameDay(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function isSameMonth(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfterDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function isWithin(date: Date, from?: Date | null, to?: Date | null): boolean {
  if (!from || !to) return false;
  const time = startOfDay(date).getTime();
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return time >= Math.min(start, end) && time <= Math.max(start, end);
}

export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isBeforeDay(date, min)) return new Date(min);
  if (max && isAfterDay(date, max)) return new Date(max);
  return date;
}

/** Aantal hele dagen tussen twee datums (b - a). */
export function differenceInDays(a: Date, b: Date): number {
  const millis = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(millis / 86_400_000);
}

/* ------------------------------------------------------------------ */
/* Weeknummer (ISO 8601)                                               */
/* ------------------------------------------------------------------ */

export function getISOWeek(date: Date): number {
  const target = startOfDay(date);
  // Donderdag van deze week bepaalt het jaar.
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  return 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

/* ------------------------------------------------------------------ */
/* Rasters                                                             */
/* ------------------------------------------------------------------ */

/** Alle dagen van de maand, aangevuld tot volledige weken (6 × 7 = 42 dagen). */
export function getMonthGrid(month: Date, weekStartsOn = 1): Date[] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: 42 }, (_, index) => addDays(first, index));
}

/** De zeven (of minder) dagen van een week vanaf een datum. */
export function getWeekDays(date: Date, weekStartsOn = 1, length = 7): Date[] {
  const first = startOfWeek(date, weekStartsOn);
  return Array.from({ length }, (_, index) => addDays(first, index));
}

/* ------------------------------------------------------------------ */
/* Formatteren                                                         */
/* ------------------------------------------------------------------ */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let cached = formatterCache.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(key, cached);
  }
  return cached;
}

export function formatDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
  locale: string = DEFAULT_LOCALE
): string {
  return formatter(locale, options).format(date);
}

/** "16 – 20 mrt 2026" of "28 feb – 3 mrt 2026" bij een maandgrens. */
export function formatDateRange(range: DateRange, locale: string = DEFAULT_LOCALE): string {
  if (!range.from) return "";
  if (!range.to || isSameDay(range.from, range.to)) return formatDate(range.from, undefined, locale);

  const sameMonth = isSameMonth(range.from, range.to);
  const sameYear = range.from.getFullYear() === range.to.getFullYear();

  const left = formatDate(
    range.from,
    sameMonth
      ? { day: "numeric" }
      : sameYear
        ? { day: "numeric", month: "short" }
        : { day: "numeric", month: "short", year: "numeric" },
    locale
  );
  const right = formatDate(range.to, { day: "numeric", month: "short", year: "numeric" }, locale);
  return `${left} – ${right}`;
}

/** Namen van de weekdagen, beginnend bij weekStartsOn. */
export function weekdayNames(
  weekStartsOn = 1,
  format: "narrow" | "short" | "long" = "short",
  locale: string = DEFAULT_LOCALE
): string[] {
  const base = new Date(2024, 0, 7); // een zondag
  return Array.from({ length: 7 }, (_, index) =>
    formatter(locale, { weekday: format }).format(addDays(base, (index + weekStartsOn) % 7))
  );
}

export function monthName(month: Date, locale: string = DEFAULT_LOCALE): string {
  return formatDate(month, { month: "long", year: "numeric" }, locale);
}

/* ------------------------------------------------------------------ */
/* Tijd (minuten sinds middernacht)                                     */
/* ------------------------------------------------------------------ */

/** "9:30", "930", "9.30" of "0930" → 570. Geeft null bij onleesbare invoer. */
export function parseTime(input: string): number | null {
  const clean = input.trim().replace(/[.,]/g, ":");
  if (!clean) return null;

  const withSeparator = clean.match(/^(\d{1,2}):(\d{1,2})$/);
  if (withSeparator) {
    return toMinutes(Number(withSeparator[1]), Number(withSeparator[2]));
  }

  const digits = clean.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 2) return toMinutes(Number(digits), 0);
  if (digits.length === 3) return toMinutes(Number(digits.slice(0, 1)), Number(digits.slice(1)));
  return toMinutes(Number(digits.slice(0, 2)), Number(digits.slice(2, 4)));
}

function toMinutes(hours: number, minutes: number): number | null {
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** 570 → "09:30". */
export function formatTime(minutes: number): string {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

/** Rondt af op een veelvoud van `step` minuten. */
export function roundToStep(minutes: number, step: number): number {
  if (step <= 0) return minutes;
  return Math.round(minutes / step) * step;
}

/** Alle tijdstippen tussen from en to, met stappen van `step` minuten. */
export function timeSlots(from: number, to: number, step: number): number[] {
  const slots: number[] = [];
  for (let minutes = from; minutes <= to; minutes += step) slots.push(minutes);
  return slots;
}

/** "2 u 30" — leesbare duur voor diensten en verlof. */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} u`;
  return `${hours} u ${rest}`;
}
