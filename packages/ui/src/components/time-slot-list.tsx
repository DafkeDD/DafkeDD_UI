"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { formatTime } from "../lib/date";
import { type ScheduleEvent, type ScheduleResource, groupByStart } from "../lib/schedule";

export interface TimeSlotListProps extends React.HTMLAttributes<HTMLDivElement> {
  events: ScheduleEvent[];
  /** Resources voor kleur, avatar en het label rechts op een kaart. */
  resources?: ScheduleResource[];
  /** Toont de naam van de resource als tag op elke kaart. */
  showResource?: boolean;
  /** Aantal kolommen waarin de kaarten van één tijdslot worden gelegd. */
  minCardWidth?: number;
  emptyLabel?: React.ReactNode;
  onEventClick?: (event: ScheduleEvent) => void;
  /** Eigen inhoud voor een kaart. */
  renderEvent?: (event: ScheduleEvent, resource?: ScheduleResource) => React.ReactNode;
  /** Extra tekst of knoppen rechtsonder op een kaart. */
  renderEventMeta?: (event: ScheduleEvent) => React.ReactNode;
}

/**
 * TimeSlotList — de dag als verticale tijdlijn: per tijdstip één regel, met
 * daarnaast een kaartje voor elke afspraak op dat moment. Leest als een
 * dagoverzicht en werkt goed op smalle schermen.
 */
export const TimeSlotList = React.forwardRef<HTMLDivElement, TimeSlotListProps>(
  function TimeSlotList(
    {
      events,
      resources,
      showResource = true,
      minCardWidth = 230,
      emptyLabel = "Niets gepland",
      onEventClick,
      renderEvent,
      renderEventMeta,
      className,
      ...rest
    },
    ref
  ) {
    const byKey = React.useMemo(() => {
      const map = new Map<string, ScheduleResource>();
      for (const resource of resources ?? []) map.set(resource.key, resource);
      return map;
    }, [resources]);

    const slots = React.useMemo(() => groupByStart(events), [events]);

    if (slots.length === 0) {
      return (
        <div ref={ref} className={cn("lui-slots", className)} {...rest}>
          <div className="lui-slots-empty">{emptyLabel}</div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("lui-slots", className)} {...rest}>
        {slots.map((slot) => (
          <div className="lui-slot" key={slot.start}>
            <div className="lui-slot-time">
              <span className="lui-slot-time-label">{formatTime(slot.start)}</span>
            </div>

            <div
              className="lui-slot-cards"
              style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))` }}
            >
              {slot.events.map((event) => {
                const resource = byKey.get(event.resource);
                const color = event.color ?? resource?.color;
                const tone = event.tone ?? "accent";

                return (
                  <div
                    key={event.id}
                    role={onEventClick && !event.blocked ? "button" : undefined}
                    tabIndex={onEventClick && !event.blocked ? 0 : undefined}
                    className={cn("lui-slot-card", event.blocked && "lui-slot-card-blocked")}
                    style={color ? ({ ["--lui-event-color" as string]: color } as React.CSSProperties) : undefined}
                    onClick={() => !event.blocked && onEventClick?.(event)}
                    onKeyDown={(keyEvent) => {
                      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                        keyEvent.preventDefault();
                        if (!event.blocked) onEventClick?.(event);
                      }
                    }}
                  >
                    {renderEvent ? (
                      renderEvent(event, resource)
                    ) : (
                      <>
                        {resource?.media && <span className="lui-slot-media">{resource.media}</span>}
                        <span className="lui-slot-body">
                          <span className="lui-slot-title">{event.title}</span>
                          <span className="lui-slot-meta">
                            {!event.blocked && (
                              <span className={cn("lui-slot-dot", `lui-tone-${tone}`)} aria-hidden="true" />
                            )}
                            {event.subtitle ?? `${event.end - event.start} min`}
                            {renderEventMeta?.(event)}
                          </span>
                        </span>
                        {showResource && resource && (
                          <span
                            className="lui-slot-tag"
                            style={
                              resource.color
                                ? {
                                    background: `color-mix(in srgb, ${resource.color} 14%, transparent)`,
                                    color: resource.color,
                                  }
                                : undefined
                            }
                          >
                            {resource.label}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }
);
