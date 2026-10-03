"use client";
import { Avatar, Swimlanes, type ScheduleEvent, type ScheduleResource } from "@dafke/ui";

const KAMERS: ScheduleResource[] = [
  { key: "k1", label: "Kabinet 1", sublabel: "Dr. Reyniers", media: <Avatar name="K 1" size={26} square /> },
  { key: "k2", label: "Kabinet 2", sublabel: "Dr. De Landsheer", media: <Avatar name="K 2" size={26} square color="var(--chart-2)" /> },
  { key: "ok", label: "Operatiekwartier", sublabel: "Zaal A", media: <Avatar name="O K" size={26} square color="var(--chart-3)" /> },
  { key: "oct", label: "OCT-ruimte", blocked: true, blockedLabel: "onderhoud", media: <Avatar name="O C" size={26} square color="var(--chart-4)" /> },
];

const BLOKKEN: ScheduleEvent[] = [
  { id: "1", resource: "k1", start: 8 * 60, end: 9 * 60 + 30, title: "Consultaties", tone: "accent" },
  { id: "2", resource: "k1", start: 10 * 60, end: 10 * 60 + 45, title: "Pauze", blocked: true },
  { id: "3", resource: "k1", start: 11 * 60, end: 13 * 60, title: "Consultaties", tone: "accent" },
  { id: "4", resource: "k2", start: 8 * 60 + 30, end: 12 * 60, title: "Spreekuur", tone: "violet" },
  { id: "5", resource: "ok", start: 9 * 60, end: 11 * 60 + 30, title: "Cataract ×3", tone: "green" },
  { id: "6", resource: "ok", start: 12 * 60, end: 13 * 60 + 30, title: "Cataract ×2", tone: "green" },
];

export default function Demo() {
  return (
    <Swimlanes
      resources={KAMERS}
      events={BLOKKEN}
      startHour={8}
      endHour={14}
      pxPerMinute={2.6}
      now={10 * 60 + 20}
      onEventClick={() => undefined}
    />
  );
}
