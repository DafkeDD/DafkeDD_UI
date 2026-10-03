import type * as React from "react";

/**
 * Gedeeld datamodel voor alle agendaweergaven.
 *
 * WeekSchedule, ResourceColumns, Swimlanes en TimeSlotList werken op precies
 * dezelfde gegevens, zodat je met één knop van weergave kunt wisselen zonder
 * je data om te bouwen.
 */

export type ScheduleTone = "accent" | "green" | "amber" | "red" | "blue" | "violet" | "neutral";

/** Een kolom of rij in de agenda: een dag, een arts, een kamer, een machine. */
export interface ScheduleResource {
  /** Unieke sleutel; events verwijzen hiernaar. */
  key: string;
  label: React.ReactNode;
  /** Tweede regel, bv. het dagnummer of het aantal afspraken. */
  sublabel?: React.ReactNode;
  /** Avatar of icoon links van het label. */
  media?: React.ReactNode;
  /** Eigen kleur voor deze resource (koptekst, tag, blokken zonder eigen kleur). */
  color?: string;
  /** Markeert deze kolom als vandaag. */
  today?: boolean;
  /** Hele kolom gearceerd, bv. een sluitingsdag of afwezigheid. */
  blocked?: boolean;
  blockedLabel?: React.ReactNode;
}

export interface ScheduleEvent {
  id: string;
  /** Sleutel van de resource (dag, arts, kamer …) waar dit item bij hoort. */
  resource: string;
  /** Begin in minuten sinds middernacht (09:30 = 570). */
  start: number;
  /** Einde in minuten sinds middernacht. */
  end: number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  tone?: ScheduleTone;
  /** Eigen kleur; overschrijft `tone` en de kleur van de resource. */
  color?: string;
  /** Kan niet versleept of aangepast worden. */
  locked?: boolean;
  /** Geblokkeerde tijd: gearceerd, nooit versleepbaar, geen klikactie. */
  blocked?: boolean;
  /** Vrij veld voor je eigen gegevens. */
  meta?: unknown;
}

/** Positie van een event wanneer overlappende items naast elkaar staan. */
export interface LaidOutEvent<T extends { start: number; end: number }> {
  event: T;
  /** Kolomindex binnen de groep overlappende items. */
  lane: number;
  /** Aantal kolommen in die groep. */
  lanes: number;
}

/**
 * Legt overlappende items naast elkaar: items die elkaar raken vormen een
 * cluster en krijgen daarbinnen elk een eigen kolom.
 */
export function packLanes<T extends { start: number; end: number }>(items: T[]): Array<LaidOutEvent<T>> {
  const sorted = [...items].sort((a, b) => a.start - b.start || a.end - b.end);
  const result: Array<LaidOutEvent<T>> = [];

  let cluster: T[] = [];
  let clusterEnd = -1;

  const flush = () => {
    if (cluster.length === 0) return;
    const laneEnds: number[] = [];
    const placed = cluster.map((event) => {
      let lane = laneEnds.findIndex((end) => end <= event.start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(event.end);
      } else {
        laneEnds[lane] = event.end;
      }
      return { event, lane };
    });
    for (const entry of placed) result.push({ ...entry, lanes: laneEnds.length });
    cluster = [];
    clusterEnd = -1;
  };

  for (const event of sorted) {
    if (cluster.length > 0 && event.start >= clusterEnd) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.end);
  }
  flush();

  return result;
}

/** Groepeert events per resource, in de volgorde van de resources zelf. */
export function groupByResource<T extends { resource: string }>(
  events: T[],
  resources: Array<{ key: string }>
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const resource of resources) map.set(resource.key, []);
  for (const event of events) {
    const list = map.get(event.resource);
    if (list) list.push(event);
  }
  for (const list of map.values()) {
    list.sort((a, b) => ((a as { start?: number }).start ?? 0) - ((b as { start?: number }).start ?? 0));
  }
  return map;
}

/** Groepeert events per starttijd, oplopend — de basis voor een tijdlijn. */
export function groupByStart<T extends { start: number }>(events: T[]): Array<{ start: number; events: T[] }> {
  const map = new Map<number, T[]>();
  for (const event of events) {
    const list = map.get(event.start) ?? [];
    list.push(event);
    map.set(event.start, list);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([start, list]) => ({ start, events: list }));
}

/** Telt de items die echt een afspraak zijn (geblokkeerde tijd niet meegerekend). */
export function countBookable(events: Array<{ blocked?: boolean }>): number {
  return events.filter((event) => !event.blocked).length;
}

/** De kleur van een event: eigen kleur, anders die van de resource, anders de toon. */
export function eventColor(
  event: { color?: string; tone?: ScheduleTone },
  resource?: { color?: string }
): string | undefined {
  return event.color ?? resource?.color;
}

/** Huidige tijd in minuten sinds middernacht. */
export function nowMinutes(): number {
  const date = new Date();
  return date.getHours() * 60 + date.getMinutes();
}
