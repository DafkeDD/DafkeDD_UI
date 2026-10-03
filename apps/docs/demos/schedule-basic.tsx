"use client";
import { useState } from "react";
import {
  Badge, Button, Icon, PeriodNav, Segmented, WeekSchedule, formatTime,
  type ScheduleChange, type ScheduleEvent, type ScheduleResource,
} from "@dafke/ui";

const DAGEN: ScheduleResource[] = [
  { key: "ma", label: "ma", sublabel: 16 },
  { key: "di", label: "di", sublabel: 17 },
  { key: "wo", label: "wo", sublabel: 18, today: true },
  { key: "do", label: "do", sublabel: 19 },
  { key: "vr", label: "vr", sublabel: 20, blocked: true, blockedLabel: "Gesloten" },
];

const WERKUREN = {
  ma: { start: 8 * 60, end: 18 * 60 },
  di: { start: 8 * 60, end: 18 * 60 },
  wo: { start: 8 * 60, end: 13 * 60 },
  do: { start: 9 * 60, end: 19 * 60 },
  vr: null,
};

const START: ScheduleEvent[] = [
  { id: "1", resource: "ma", start: 8 * 60 + 30, end: 12 * 60, title: "Consultatie", subtitle: "Dr. Verhoeven", tone: "accent" },
  { id: "2", resource: "ma", start: 9 * 60, end: 11 * 60, title: "Onthaal", subtitle: "Ilse", tone: "blue" },
  { id: "3", resource: "ma", start: 13 * 60, end: 17 * 60, title: "Operaties", subtitle: "Zaal 2", tone: "violet" },
  { id: "4", resource: "di", start: 9 * 60, end: 12 * 60 + 30, title: "Consultatie", tone: "accent" },
  { id: "5", resource: "di", start: 14 * 60, end: 18 * 60, title: "Nazorg", subtitle: "Karim", tone: "green" },
  { id: "6", resource: "wo", start: 8 * 60, end: 12 * 60, title: "Consultatie", tone: "accent" },
  { id: "7", resource: "do", start: 10 * 60, end: 13 * 60, title: "Teamoverleg", tone: "amber", locked: true },
  { id: "8", resource: "do", start: 14 * 60, end: 18 * 60 + 30, title: "Consultatie", subtitle: "Dr. Peeters", tone: "accent" },
];

export default function Demo() {
  const [events, setEvents] = useState(START);
  const [week, setWeek] = useState(12);
  const [laatste, setLaatste] = useState<string | null>(null);

  const verplaats = (id: string, change: ScheduleChange) => {
    setEvents((prev) => prev.map((item) => (item.id === id ? { ...item, ...change } : item)));
    const item = events.find((entry) => entry.id === id);
    setLaatste(`${item?.title} → ${change.resource} ${formatTime(change.start)}–${formatTime(change.end)}`);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <PeriodNav
          label={`Week ${week}`}
          onPrevious={() => setWeek((w) => w - 1)}
          onNext={() => setWeek((w) => w + 1)}
          onToday={() => setWeek(12)}
        />
        <Segmented
          size="sm"
          options={[
            { value: "raster", label: "Tijdraster" },
            { value: "lijst", label: "Medewerkers" },
          ]}
        />
        <span style={{ flex: 1 }} />
        <Badge tone="neutral">{events.length} diensten</Badge>
        <Button size="sm" icon={<Icon name="plus" />}>Nieuwe dienst</Button>
      </div>

      <WeekSchedule
        resources={DAGEN}
        events={events}
        workingHours={WERKUREN}
        startHour={7}
        endHour={20}
        now={10 * 60 + 20}
        onEventChange={verplaats}
        onEventClick={(item) => setLaatste(`Geklikt: ${item.title}`)}
        onSlotClick={(resource, start) =>
          setEvents((prev) => [
            ...prev,
            {
              id: `n${prev.length + 1}`,
              resource,
              start,
              end: start + 60,
              title: "Nieuwe dienst",
              tone: "neutral",
            },
          ])
        }
        style={{ maxHeight: 460 }}
      />

      <p style={{ fontSize: 13, color: "var(--text-3)" }}>
        Sleep een blok naar een andere dag of tijd, pak de onderrand om de duur aan te passen, of klik op een
        leeg stuk om er een dienst bij te zetten. Met het toetsenbord: ↑↓ verschuiven, ⇧↑↓ verkorten of
        verlengen, ←→ naar een andere dag. {laatste && <strong>{laatste}</strong>}
      </p>
    </div>
  );
}
