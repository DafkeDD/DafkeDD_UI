"use client";
import { useState } from "react";
import {
  Avatar, Button, Icon, ResourceColumns, Switch, type ScheduleEvent, type ScheduleResource,
} from "@dafke/ui";

const ARTSEN: ScheduleResource[] = [
  { key: "reyniers", label: "Dr. Reyniers", media: <Avatar name="Rik Reyniers" size={28} /> },
  { key: "landsheer", label: "Dr. De Landsheer", media: <Avatar name="An De Landsheer" size={28} color="var(--chart-2)" /> },
  { key: "miroir", label: "Mr. Miroir", media: <Avatar name="Paul Miroir" size={28} color="var(--chart-3)" /> },
  { key: "aerts", label: "Dr. Aerts", media: <Avatar name="Eva Aerts" size={28} color="var(--chart-4)" /> },
];

const AFSPRAKEN: ScheduleEvent[] = [
  { id: "1", resource: "reyniers", start: 510, end: 540, title: "Lisa Vanreppelen", tone: "green" },
  { id: "2", resource: "reyniers", start: 555, end: 600, title: "Jan Coppens", subtitle: "nieuw", tone: "amber" },
  { id: "3", resource: "reyniers", start: 615, end: 660, title: "Pauze", blocked: true },
  { id: "4", resource: "landsheer", start: 525, end: 570, title: "Nadia Peeters", tone: "violet" },
  { id: "5", resource: "landsheer", start: 585, end: 630, title: "Karim El Khattabi", tone: "green" },
  { id: "6", resource: "miroir", start: 540, end: 600, title: "Tom Willems", tone: "green" },
];

export default function Demo() {
  const [smart, setSmart] = useState(true);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Switch
        checked={smart}
        onCheckedChange={setSmart}
        label="Lege kolommen inklappen"
        description="Dr. Aerts heeft vandaag niets staan en krimpt tot een smalle rail."
      />
      <ResourceColumns
        resources={ARTSEN}
        events={AFSPRAKEN}
        collapseEmpty={smart}
        maxHeight={280}
        onEventClick={() => undefined}
        renderResourceActions={() => (
          <Button size="sm" variant="ghost" icon={<Icon name="more" />} aria-label="Meer" />
        )}
        renderEventActions={() => (
          <Button size="sm" variant="ghost" icon={<Icon name="search" />} aria-label="Zoeken" />
        )}
      />
    </div>
  );
}
