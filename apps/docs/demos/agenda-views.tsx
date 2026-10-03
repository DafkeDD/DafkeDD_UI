"use client";
import { useState } from "react";
import {
  Avatar, Badge, Icon, PeriodNav, ResourceColumns, Segmented, Swimlanes, TimeSlotList,
  WeekSchedule, type ScheduleEvent, type ScheduleResource,
} from "@dafke/ui";

/* ---------- Eén datamodel voor alle vier de weergaven ---------- */
const ARTSEN: ScheduleResource[] = [
  { key: "reyniers", label: "Dr. Reyniers", color: "var(--chart-1)", media: <Avatar name="Rik Reyniers" size={28} color="var(--chart-1)" /> },
  { key: "landsheer", label: "Dr. De Landsheer", color: "var(--chart-2)", media: <Avatar name="An De Landsheer" size={28} color="var(--chart-2)" /> },
  { key: "miroir", label: "Mr. Miroir", color: "var(--chart-3)", media: <Avatar name="Paul Miroir" size={28} color="var(--chart-3)" /> },
  { key: "vrij", label: "Dr. Aerts", color: "var(--chart-4)", media: <Avatar name="Eva Aerts" size={28} color="var(--chart-4)" /> },
];

const AFSPRAKEN: ScheduleEvent[] = [
  { id: "1", resource: "reyniers", start: 8 * 60, end: 8 * 60 + 30, title: "Lisa Vanreppelen", subtitle: "Controle", tone: "green" },
  { id: "2", resource: "reyniers", start: 8 * 60 + 45, end: 9 * 60 + 30, title: "Jan Coppens", subtitle: "Nieuw dossier", tone: "amber" },
  { id: "3", resource: "reyniers", start: 10 * 60, end: 11 * 60, title: "Middagpauze", blocked: true },
  { id: "4", resource: "landsheer", start: 8 * 60 + 30, end: 9 * 60 + 15, title: "Nadia Peeters", subtitle: "Follow-up", tone: "violet" },
  { id: "5", resource: "landsheer", start: 9 * 60 + 30, end: 10 * 60 + 30, title: "Karim El Khattabi", tone: "green" },
  { id: "6", resource: "landsheer", start: 10 * 60 + 45, end: 11 * 60 + 15, title: "Sofie Claes", subtitle: "Geannuleerd", tone: "red" },
  { id: "7", resource: "miroir", start: 9 * 60, end: 10 * 60, title: "Tom Willems", tone: "green" },
  { id: "8", resource: "miroir", start: 9 * 60 + 30, end: 10 * 60 + 30, title: "Els Maes", subtitle: "Dubbel geboekt", tone: "amber" },
];

const WEERGAVEN = [
  { value: "kolommen", label: "Kolommen", icon: <Icon name="menu" /> },
  { value: "raster", label: "Tijdsraster", icon: <Icon name="dashboard" /> },
  { value: "tijdlijn", label: "Tijdlijn", icon: <Icon name="clock" /> },
  { value: "swimlanes", label: "Swimlanes", icon: <Icon name="layers" /> },
];

export default function Demo() {
  const [weergave, setWeergave] = useState("kolommen");
  const [gekozen, setGekozen] = useState<string | null>(null);

  const klik = (event: ScheduleEvent) => setGekozen(String(event.title));

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <PeriodNav label="di 2 juni" onPrevious={() => undefined} onNext={() => undefined} onToday={() => undefined} />
        <Segmented size="sm" options={WEERGAVEN} value={weergave} onValueChange={setWeergave} />
        <span style={{ flex: 1 }} />
        {gekozen && <Badge tone="accent">{gekozen}</Badge>}
      </div>

      {weergave === "kolommen" && (
        <ResourceColumns resources={ARTSEN} events={AFSPRAKEN} collapseEmpty onEventClick={klik} maxHeight={300} />
      )}

      {weergave === "raster" && (
        <WeekSchedule
          resources={ARTSEN}
          events={AFSPRAKEN}
          startHour={8}
          endHour={12}
          hourHeight={70}
          now={9 * 60 + 40}
          onEventClick={klik}
          style={{ maxHeight: 380 }}
        />
      )}

      {weergave === "tijdlijn" && (
        <TimeSlotList events={AFSPRAKEN} resources={ARTSEN} onEventClick={klik} />
      )}

      {weergave === "swimlanes" && (
        <Swimlanes
          resources={ARTSEN}
          events={AFSPRAKEN}
          startHour={8}
          endHour={12}
          pxPerMinute={3}
          now={9 * 60 + 40}
          onEventClick={klik}
        />
      )}

      <p style={{ fontSize: 13, color: "var(--text-3)" }}>
        Vier weergaven, exact dezelfde <code className="docs-inline-code">resources</code> en{" "}
        <code className="docs-inline-code">events</code>. Wisselen kost geen enkele omzetting van je data.
      </p>
    </div>
  );
}
