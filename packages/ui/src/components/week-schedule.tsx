"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useMounted } from "../lib/hooks";
import { formatTime } from "../lib/date";

import {
  type LaidOutEvent,
  type ScheduleEvent,
  type ScheduleResource,
  type ScheduleTone,
  packLanes,
} from "../lib/schedule";

export type { ScheduleEvent, ScheduleResource, ScheduleTone };

/** Oude naam voor ScheduleResource; blijft werken. */
export type ScheduleDay = ScheduleResource;

/** Een event zoals WeekSchedule het accepteert: `resource` of het oudere `day`. */
export type WeekScheduleEvent = Omit<ScheduleEvent, "resource"> & { resource?: string; day?: string };

export interface ScheduleChange {
  /** Sleutel van de kolom waar het blok nu staat. */
  resource: string;
  /** Zelfde waarde als `resource`; blijft bestaan voor bestaande code. */
  day: string;
  start: number;
  end: number;
}

export interface WeekScheduleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Kolommen: dagen, artsen, kamers … Gedeeld met de andere agendaweergaven. */
  resources?: ScheduleResource[];
  /** Oude naam voor `resources`; blijft werken. */
  days?: ScheduleResource[];
  events: WeekScheduleEvent[];
  /** Eerste zichtbare uur. */
  startHour?: number;
  /** Laatste zichtbare uur. */
  endHour?: number;
  /** Hoogte van één uur in pixels. */
  hourHeight?: number;
  /** Rooster waarop verslepen vastklikt, in minuten. */
  step?: number;
  /** Kortste duur bij het verkleinen van een blok. */
  minDuration?: number;
  /** Werkuren per kolomsleutel; daarbuiten wordt gearceerd. */
  workingHours?: Record<string, { start: number; end: number } | null | undefined>;
  /** Lijn met de huidige tijd (alleen op de dag met `today`). */
  nowIndicator?: boolean;
  /** Voor tests: vaste "nu"-tijd in minuten. */
  now?: number;
  /** Blokken kunnen niet versleept of aangepast worden. */
  readOnly?: boolean;
  onEventClick?: (event: ScheduleEvent) => void;
  /** Wordt aangeroepen na slepen of verkleinen. */
  onEventChange?: (id: string, change: ScheduleChange) => void;
  /** Klik op een leeg stuk van een dagkolom. */
  onSlotClick?: (resource: string, start: number) => void;
  /** Eigen inhoud in een blok. */
  renderEvent?: (event: ScheduleEvent) => React.ReactNode;
}

interface DragState {
  id: string;
  mode: "move" | "resize";
  pointerId: number;
  grabOffset: number;
  duration: number;
  draft: ScheduleChange;
}

/**
 * WeekSchedule — weekplanning met uurraster, gepositioneerde blokken,
 * overlappende diensten naast elkaar, en eigen drag & drop (geen dnd-library).
 */
export const WeekSchedule = React.forwardRef<HTMLDivElement, WeekScheduleProps>(function WeekSchedule(
  {
    resources,
    days,
    events,
    startHour = 7,
    endHour = 19,
    hourHeight = 56,
    step = 15,
    minDuration = 15,
    workingHours,
    nowIndicator = true,
    now,
    readOnly,
    onEventClick,
    onEventChange,
    onSlotClick,
    renderEvent,
    className,
    style,
    ...rest
  },
  ref
) {
  // Eén model, twee namen: `resources` is de nieuwe, `days` blijft werken.
  const columnsList = React.useMemo<ScheduleResource[]>(() => resources ?? days ?? [], [resources, days]);
  const items = React.useMemo<ScheduleEvent[]>(
    () => events.map((event) => ({ ...event, resource: event.resource ?? event.day ?? "" })),
    [events]
  );

  const dayStart = startHour * 60;
  const dayEnd = endHour * 60;
  const totalMinutes = Math.max(60, dayEnd - dayStart);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [clock, setClock] = React.useState<number>(() => now ?? minutesNow());

  React.useEffect(() => {
    if (now != null || !nowIndicator) return;
    const timer = window.setInterval(() => setClock(minutesNow()), 60_000);
    return () => window.clearInterval(timer);
  }, [now, nowIndicator]);

  // Zonder vaste now-prop kent de server de klok van de bezoeker niet; de
  // lijn verschijnt daarom pas na de eerste render in de browser.
  const gemonteerd = useMounted();
  const toonNu = now != null || gemonteerd;
  const currentMinutes = now ?? clock;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);

  const toOffset = (minutes: number) => ((minutes - dayStart) / 60) * hourHeight;
  const toMinutes = (offset: number) => dayStart + (offset / hourHeight) * 60;
  const snap = (minutes: number) => Math.round(minutes / step) * step;

  /* ---------------- Slepen ---------------- */
  const columnRects = () => {
    const nodes = bodyRef.current?.querySelectorAll<HTMLElement>("[data-day-key]") ?? [];
    return Array.from(nodes).map((node) => ({
      key: node.dataset.dayKey as string,
      rect: node.getBoundingClientRect(),
    }));
  };

  const beginDrag = (
    event: React.PointerEvent,
    item: ScheduleEvent,
    mode: "move" | "resize"
  ) => {
    if (readOnly || item.locked || item.blocked || !onEventChange) return;
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);

    const column = (event.currentTarget as HTMLElement).closest<HTMLElement>("[data-day-key]");
    const top = column?.getBoundingClientRect().top ?? 0;
    const pointerMinutes = toMinutes(event.clientY - top);

    setDrag({
      id: item.id,
      mode,
      pointerId: event.pointerId,
      grabOffset: pointerMinutes - item.start,
      duration: item.end - item.start,
      draft: change(item.resource, item.start, item.end),
    });
  };

  const moveDrag = (event: React.PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const columns = columnRects();
    if (columns.length === 0) return;

    const column =
      columns.find((entry) => event.clientX >= entry.rect.left && event.clientX <= entry.rect.right) ??
      columns.find((entry) => entry.key === drag.draft.resource) ??
      columns[0];

    const pointerMinutes = toMinutes(event.clientY - column.rect.top);

    if (drag.mode === "move") {
      let start = snap(pointerMinutes - drag.grabOffset);
      start = Math.min(Math.max(start, dayStart), dayEnd - drag.duration);
      setDrag({ ...drag, draft: change(column.key, start, start + drag.duration) });
      return;
    }

    let end = snap(pointerMinutes);
    end = Math.min(Math.max(end, drag.draft.start + minDuration), dayEnd);
    setDrag({ ...drag, draft: { ...drag.draft, end } });
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const original = items.find((entry) => entry.id === drag.id);
    const changed =
      original &&
      (original.resource !== drag.draft.resource ||
        original.start !== drag.draft.start ||
        original.end !== drag.draft.end);
    if (changed) onEventChange?.(drag.id, drag.draft);
    setDrag(null);
  };

  /* ---------------- Toetsenbord ---------------- */
  const onEventKeyDown = (event: React.KeyboardEvent, item: ScheduleEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEventClick?.(item);
      return;
    }
    if (readOnly || item.locked || item.blocked || !onEventChange) return;

    const dayIndex = columnsList.findIndex((column) => column.key === item.resource);
    const duration = item.end - item.start;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      if (event.shiftKey) {
        const end = Math.min(Math.max(item.end + direction * step, item.start + minDuration), dayEnd);
        onEventChange(item.id, change(item.resource, item.start, end));
        return;
      }
      const start = Math.min(Math.max(item.start + direction * step, dayStart), dayEnd - duration);
      onEventChange(item.id, change(item.resource, start, start + duration));
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = dayIndex + (event.key === "ArrowLeft" ? -1 : 1);
      if (next < 0 || next >= columnsList.length) return;
      onEventChange(item.id, change(columnsList[next].key, item.start, item.end));
    }
  };

  /* ---------------- Weergave ---------------- */
  const eventsByColumn = React.useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const column of columnsList) map.set(column.key, []);
    for (const item of items) {
      const draft = drag?.id === item.id ? { ...item, ...drag.draft } : item;
      const list = map.get(draft.resource);
      if (list) list.push(draft);
    }
    return map;
  }, [columnsList, items, drag]);

  return (
    <div
      ref={ref}
      className={cn("lui-schedule", drag && "lui-schedule-dragging", className)}
      style={
        {
          ...style,
          ["--lui-hour-height" as string]: `${hourHeight}px`,
          ["--lui-schedule-columns" as string]: String(columnsList.length),
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="lui-schedule-scroll">
        <div className="lui-schedule-inner">
          {/* Kop met dagen */}
          <div className="lui-schedule-head">
            <div className="lui-schedule-gutter-head" />
            {columnsList.map((day) => (
              <div
                key={day.key}
                className="lui-schedule-dayhead"
                data-today={day.today ? "" : undefined}
              >
                <span className="lui-schedule-dayname">{day.label}</span>
                {day.sublabel && <span className="lui-schedule-daysub">{day.sublabel}</span>}
              </div>
            ))}
          </div>

          {/* Raster */}
          <div
            className="lui-schedule-body"
            ref={bodyRef}
            style={{ height: (totalMinutes / 60) * hourHeight }}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="lui-schedule-gutter">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="lui-schedule-hour"
                  style={{ top: toOffset(hour * 60) }}
                >
                  {formatTime(hour * 60)}
                </span>
              ))}
            </div>

            {columnsList.map((day) => {
              const work = workingHours?.[day.key];
              const laid = packLanes(eventsByColumn.get(day.key) ?? []);

              return (
                <div key={day.key} className="lui-schedule-column" data-day-key={day.key}>
                  {/* Uurlijnen */}
                  <div className="lui-schedule-lines" aria-hidden="true" />

                  {/* Buiten de werkuren */}
                  {day.blocked ? (
                    <div className="lui-schedule-hatch lui-schedule-hatch-full">
                      {day.blockedLabel && (
                        <span className="lui-schedule-hatch-label">{day.blockedLabel}</span>
                      )}
                    </div>
                  ) : (
                    work && (
                      <>
                        {work.start > dayStart && (
                          <div
                            className="lui-schedule-hatch"
                            style={{ top: 0, height: toOffset(work.start) }}
                          />
                        )}
                        {work.end < dayEnd && (
                          <div
                            className="lui-schedule-hatch"
                            style={{ top: toOffset(work.end), bottom: 0 }}
                          />
                        )}
                      </>
                    )
                  )}

                  {/* Klikvlak voor nieuwe blokken */}
                  {onSlotClick && !readOnly && !day.blocked && (
                    <button
                      type="button"
                      className="lui-schedule-slots"
                      aria-label={`Nieuw blok op ${day.label}`}
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        onSlotClick(day.key, snap(toMinutes(event.clientY - rect.top)));
                      }}
                    />
                  )}

                  {/* Nu-lijn */}
                  {nowIndicator && toonNu && day.today && currentMinutes >= dayStart && currentMinutes <= dayEnd && (
                    <div className="lui-schedule-now" style={{ top: toOffset(currentMinutes) }}>
                      <span className="lui-schedule-now-dot" />
                    </div>
                  )}

                  {/* Blokken */}
                  {laid.map(({ event: item, lane, lanes }: LaidOutEvent<ScheduleEvent>) => {
                    const top = toOffset(Math.max(item.start, dayStart));
                    const height = Math.max(
                      18,
                      toOffset(Math.min(item.end, dayEnd)) - toOffset(Math.max(item.start, dayStart))
                    );
                    const width = 100 / lanes;
                    const isDragging = drag?.id === item.id;
                    const tone = item.tone ?? "accent";
                    const isBlocked = Boolean(item.blocked);

                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        data-dragging={isDragging ? "" : undefined}
                        data-locked={item.locked || isBlocked ? "" : undefined}
                        data-blocked={isBlocked ? "" : undefined}
                        className={cn(
                          "lui-schedule-event",
                          isBlocked ? "lui-schedule-event-blocked" : `lui-schedule-event-${tone}`
                        )}
                        style={{
                          top,
                          height,
                          left: `calc(${lane * width}% + 2px)`,
                          width: `calc(${width}% - 4px)`,
                          ...(item.color
                            ? ({ ["--lui-event-color" as string]: item.color } as React.CSSProperties)
                            : {}),
                        }}
                        onPointerDown={(event) => !isBlocked && beginDrag(event, item, "move")}
                        onClick={() => !drag && !isBlocked && onEventClick?.(item)}
                        onKeyDown={(event) => onEventKeyDown(event, item)}
                        aria-label={`${item.title}, ${formatTime(item.start)} tot ${formatTime(item.end)}`}
                      >
                        {renderEvent ? (
                          renderEvent(item)
                        ) : (
                          <>
                            <span className="lui-schedule-event-time">
                              {formatTime(item.start)} – {formatTime(item.end)}
                            </span>
                            <span className="lui-schedule-event-title">{item.title}</span>
                            {item.subtitle && height > 54 && (
                              <span className="lui-schedule-event-sub">{item.subtitle}</span>
                            )}
                          </>
                        )}

                        {!readOnly && !item.locked && !isBlocked && onEventChange && (
                          <span
                            className="lui-schedule-handle"
                            aria-hidden="true"
                            onPointerDown={(event) => beginDrag(event, item, "resize")}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

function change(resource: string, start: number, end: number): ScheduleChange {
  return { resource, day: resource, start, end };
}

function minutesNow(): number {
  const date = new Date();
  return date.getHours() * 60 + date.getMinutes();
}
