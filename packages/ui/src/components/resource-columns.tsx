"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { formatTime } from "../lib/date";
import {
  type ScheduleEvent,
  type ScheduleResource,
  countBookable,
  groupByResource,
} from "../lib/schedule";

export interface ResourceColumnsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Kolommen: artsen, kamers, monteurs … */
  resources: ScheduleResource[];
  events: ScheduleEvent[];
  /** Lege kolommen krimpen tot een smalle rail met alleen de naam. */
  collapseEmpty?: boolean;
  /** Minimale breedte van een kolom voordat er horizontaal gescrold wordt. */
  minColumnWidth?: number;
  /** Maximale hoogte van de lijst in een kolom. */
  maxHeight?: number | string;
  emptyLabel?: React.ReactNode;
  /** Tekst achter het aantal, bv. "afspraken". */
  countLabel?: string;
  onEventClick?: (event: ScheduleEvent) => void;
  /** Knoppen rechts in de kolomkop. */
  renderResourceActions?: (resource: ScheduleResource) => React.ReactNode;
  /** Knoppen rechts in een rij. */
  renderEventActions?: (event: ScheduleEvent) => React.ReactNode;
  /** Eigen inhoud voor een rij. */
  renderEvent?: (event: ScheduleEvent) => React.ReactNode;
}

/**
 * ResourceColumns — de klassieke dagagenda: één kolom per arts of kamer, met
 * daarin een lijst van tijd, status en naam. Met `collapseEmpty` schuiven
 * kolommen zonder afspraken samen tot een smalle rail, zodat de drukke kolommen
 * alle ruimte krijgen.
 */
export const ResourceColumns = React.forwardRef<HTMLDivElement, ResourceColumnsProps>(
  function ResourceColumns(
    {
      resources,
      events,
      collapseEmpty,
      minColumnWidth = 230,
      maxHeight = 460,
      emptyLabel = "Geen afspraken",
      countLabel = "afspraken",
      onEventClick,
      renderResourceActions,
      renderEventActions,
      renderEvent,
      className,
      ...rest
    },
    ref
  ) {
    const byResource = React.useMemo(() => groupByResource(events, resources), [events, resources]);

    return (
      <div ref={ref} className={cn("lui-rescols", className)} {...rest}>
        {resources.map((resource) => {
          const list = byResource.get(resource.key) ?? [];
          const empty = list.length === 0;
          const collapsed = Boolean(collapseEmpty && empty);

          if (collapsed) {
            return (
              <div className="lui-rescol lui-rescol-collapsed" key={resource.key}>
                <div className="lui-rescol-rail">
                  {resource.media}
                  <span className="lui-rescol-rail-label">{resource.label} · vrij</span>
                </div>
              </div>
            );
          }

          return (
            <div
              className="lui-rescol"
              key={resource.key}
              style={{ minWidth: minColumnWidth }}
              data-today={resource.today ? "" : undefined}
            >
              <div className="lui-rescol-head">
                {resource.media && <span className="lui-rescol-media">{resource.media}</span>}
                <div className="lui-rescol-info">
                  <div className="lui-rescol-name">{resource.label}</div>
                  <div className="lui-rescol-count">
                    {resource.sublabel ?? `${countBookable(list)} ${countLabel}`}
                  </div>
                </div>
                {renderResourceActions && (
                  <div className="lui-rescol-actions">{renderResourceActions(resource)}</div>
                )}
              </div>

              <div className="lui-rescol-list" style={{ maxHeight }}>
                {empty ? (
                  <div className="lui-rescol-empty">{emptyLabel}</div>
                ) : (
                  list.map((event) =>
                    event.blocked ? (
                      <div className="lui-rescol-blocked" key={event.id}>
                        <span className="lui-rescol-time">{formatTime(event.start)}</span>
                        <span className="lui-rescol-blocked-label">{event.title}</span>
                      </div>
                    ) : (
                      <div
                        key={event.id}
                        role={onEventClick ? "button" : undefined}
                        tabIndex={onEventClick ? 0 : undefined}
                        className={cn("lui-rescol-row", onEventClick && "lui-rescol-row-clickable")}
                        onClick={() => onEventClick?.(event)}
                        onKeyDown={(keyEvent) => {
                          if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                            keyEvent.preventDefault();
                            onEventClick?.(event);
                          }
                        }}
                      >
                        {renderEvent ? (
                          renderEvent(event)
                        ) : (
                          <>
                            <span className="lui-rescol-time">{formatTime(event.start)}</span>
                            <span
                              className={cn("lui-rescol-dot", `lui-tone-${event.tone ?? "neutral"}`)}
                              style={event.color ? { background: event.color } : undefined}
                            />
                            <span className="lui-rescol-title">
                              {event.title}
                              {event.subtitle && (
                                <span className="lui-rescol-sub">{event.subtitle}</span>
                              )}
                            </span>
                          </>
                        )}
                        {renderEventActions && (
                          <span
                            className="lui-rescol-row-actions"
                            onClick={(clickEvent) => clickEvent.stopPropagation()}
                          >
                            {renderEventActions(event)}
                          </span>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);
