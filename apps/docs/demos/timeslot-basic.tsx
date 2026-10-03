"use client";
import { Avatar, TimeSlotList, type ScheduleEvent, type ScheduleResource } from "@dafke/ui";

const ARTSEN: ScheduleResource[] = [
  { key: "reyniers", label: "Dr. Reyniers", color: "var(--chart-1)", media: <Avatar name="Rik Reyniers" size={30} color="var(--chart-1)" /> },
  { key: "landsheer", label: "Dr. De Landsheer", color: "var(--chart-2)", media: <Avatar name="An De Landsheer" size={30} color="var(--chart-2)" /> },
  { key: "miroir", label: "Mr. Miroir", color: "var(--chart-3)", media: <Avatar name="Paul Miroir" size={30} color="var(--chart-3)" /> },
];

const AFSPRAKEN: ScheduleEvent[] = [
  { id: "1", resource: "reyniers", start: 510, end: 540, title: "Lisa Vanreppelen", subtitle: "Bevestigd · 30 min", tone: "green" },
  { id: "2", resource: "landsheer", start: 510, end: 555, title: "Nadia Peeters", subtitle: "In afwachting · 45 min", tone: "amber" },
  { id: "3", resource: "miroir", start: 540, end: 600, title: "Tom Willems", subtitle: "Bevestigd · 60 min", tone: "green" },
  { id: "4", resource: "reyniers", start: 540, end: 570, title: "Pauze", blocked: true },
  { id: "5", resource: "landsheer", start: 600, end: 630, title: "Sofie Claes", subtitle: "Follow-up vereist", tone: "violet" },
];

export default function Demo() {
  return <TimeSlotList events={AFSPRAKEN} resources={ARTSEN} onEventClick={() => undefined} />;
}
