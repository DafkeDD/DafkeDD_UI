"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useMounted } from "../lib/hooks";
import { formatTime } from "../lib/date";
import {
  type ScheduleEvent,
  type ScheduleResource,
  countBookable,
  groupByResource,
  nowMinutes,
} from "../lib/schedule";

export interface SwimlanesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rijen: artsen, kamers, machines … */
  resources: ScheduleResource[];
  events: ScheduleEvent[];
  /** Eerste zichtbare uur. */
  startHour?: number;
  /** Laatste zichtbare uur. */
  endHour?: number;
  /** Breedte van één minuut in pixels. */
  pxPerMinute?: number;
  /** Hoogte van een baan. */
  laneHeight?: number;
  /** Breedte van de vaste kolom links. */
  labelWidth?: number;
  /** Verticale lijn op de huidige tijd. */
  nowIndicator?: boolean;
  /** Voor tests: vaste "nu"-tijd in minuten. */
  now?: number;
  emptyLabel?: React.ReactNode;
  countLabel?: string;
  onEventClick?: (event: ScheduleEvent) => void;
  /** Klik op een leeg stuk van een baan. */
  onSlotClick?: (resource: string, start: number) => void;
  /** Rooster waarop een klik vastklikt, in minuten. */
  step?: number;
  renderEvent?: (event: ScheduleEvent) => React.ReactNode;
}

/**
 * Swimlanes — de agenda op zijn kant: één baan per resource, tijd loopt van
 * links naar rechts. Handig om in één oogopslag gaten en overlappingen tussen
 * mensen of ruimtes te zien.
 */
export const Swimlanes = React.forwardRef<HTMLDivElement, SwimlanesProps>(function Swimlanes(
  {
    resources,
    events,
    startHour = 8,
    endHour = 18,
    pxPerMinute = 2.4,
    laneHeight = 54,
    labelWidth = 180,
    nowIndicator = true,
    now,
    emptyLabel = "— vrij —",
    countLabel = "afspraken",
    onEventClick,
    onSlotClick,
    step = 15,
    renderEvent,
    className,
    style,
    ...rest
  },
  ref
) {
  const dayStart = startHour * 60;
  const dayEnd = endHour * 60;
  const trackWidth = (dayEnd - dayStart) * pxPerMinute;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index);

  const [clock, setClock] = React.useState<number>(() => now ?? nowMinutes());
  React.useEffect(() => {
    if (now != null || !nowIndicator) return;
    const timer = window.setInterval(() => setClock(nowMinutes()), 60_000);
    return () => window.clearInterval(timer);
  }, [now, nowIndicator]);
  // Zonder vaste now-prop kent de server de klok van de bezoeker niet; de
  // lijn verschijnt daarom pas na de eerste render in de browser.
  const gemonteerd = useMounted();
  const toonNu = now != null || gemonteerd;
  const currentMinutes = now ?? clock;

  const byResource = React.useMemo(() => groupByResource(events, resources), [events, resources]);

  return (
    <div
      ref={ref}
      className={cn("lui-swim", className)}
      style={
        {
          ...style,
          ["--lui-swim-label" as string]: `${labelWidth}px`,
          ["--lui-swim-lane" as string]: `${laneHeight}px`,
          ["--lui-swim-hour" as string]: `${60 * pxPerMinute}px`,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="lui-swim-scroll">
        <div className="lui-swim-inner" style={{ width: labelWidth + trackWidth }}>
          {/* Tijdas */}
          <div className="lui-swim-axis">
            <div className="lui-swim-axis-label" />
            <div className="lui-swim-axis-track" style={{ width: trackWidth }}>
              {hours.map((hour) => (
                <span
                  key={hour}
                  className="lui-swim-tick"
                  style={{ left: (hour * 60 - dayStart) * pxPerMinute }}
                >
                  {formatTime(hour * 60)}
                </span>
              ))}
            </div>
          </div>

          {/* Banen */}
          {resources.map((resource) => {
            const list = byResource.get(resource.key) ?? [];

            return (
              <div className="lui-swim-lane" key={resource.key} data-today={resource.today ? "" : undefined}>
                <div className="lui-swim-label">
                  {resource.media && <span className="lui-swim-media">{resource.media}</span>}
                  <span className="lui-swim-label-text">
                    <span className="lui-swim-name">{resource.label}</span>
                    <span className="lui-swim-count">
                      {resource.sublabel ?? `${countBookable(list)} ${countLabel}`}
                    </span>
                  </span>
                </div>

                <div className="lui-swim-track" style={{ width: trackWidth }}>
                  <div className="lui-swim-lines" aria-hidden="true" />

                  {resource.blocked && (
                    <div className="lui-swim-blocked-full">
                      {resource.blockedLabel && (
                        <span className="lui-swim-blocked-label">{resource.blockedLabel}</span>
                      )}
                    </div>
                  )}

                  {onSlotClick && !resource.blocked && (
                    <button
                      type="button"
                      className="lui-swim-slots"
                      aria-label={`Nieuw item bij ${String(resource.label)}`}
                      onClick={(clickEvent) => {
                        const rect = clickEvent.currentTarget.getBoundingClientRect();
                        const minutes = dayStart + (clickEvent.clientX - rect.left) / pxPerMinute;
                        onSlotClick(resource.key, Math.round(minutes / step) * step);
                      }}
                    />
                  )}

                  {list.length === 0 && !resource.blocked && (
                    <span className="lui-swim-empty">{emptyLabel}</span>
                  )}

                  {list.map((event) => {
                    const left = (Math.max(event.start, dayStart) - dayStart) * pxPerMinute;
                    const width = Math.max(
                      (Math.min(event.end, dayEnd) - Math.max(event.start, dayStart)) * pxPerMinute - 3,
                      26
                    );
                    const tone = event.tone ?? "accent";

                    return (
                      <div
                        key={event.id}
                        role={onEventClick && !event.blocked ? "button" : undefined}
                        tabIndex={onEventClick && !event.blocked ? 0 : undefined}
                        className={cn(
                          "lui-swim-appt",
                          event.blocked ? "lui-swim-appt-blocked" : `lui-swim-appt-${tone}`
                        )}
                        style={{
                          left,
                          width,
                          ...(event.color
                            ? ({ ["--lui-event-color" as string]: event.color } as React.CSSProperties)
                            : {}),
                        }}
                        title={`${formatTime(event.start)} – ${formatTime(event.end)}`}
                        onClick={() => !event.blocked && onEventClick?.(event)}
                        onKeyDown={(keyEvent) => {
                          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                            keyEvent.preventDefault();
                            if (!event.blocked) onEventClick?.(event);
                          }
                        }}
                      >
                        {renderEvent ? (
                          renderEvent(event)
                        ) : (
                          <>
                            <span className="lui-swim-appt-time">{formatTime(event.start)}</span>
                            <span className="lui-swim-appt-title">{event.title}</span>
                          </>
                        )}
                      </div>
                    );
                  })}

                  {nowIndicator && toonNu && currentMinutes >= dayStart && currentMinutes <= dayEnd && (
                    <div
                      className="lui-swim-now"
                      style={{ left: (currentMinutes - dayStart) * pxPerMinute }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
