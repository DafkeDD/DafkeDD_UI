"use client";
import { Card, CardContent, DataPill, Icon, SectionHeader } from "@dafke/ui";

export default function Demo() {
  return (
    <Card style={{ maxWidth: 560 }}>
      <CardContent>
        <SectionHeader title="Laatste metingen" count="17 apr" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <DataPill label="Visus OD" value="0.8" />
          <DataPill label="Visus OS" value="0.9" />
          <DataPill label="IOP OD" value="18" unit="mmHg" tone="amber" />
          <DataPill label="IOP OS" value="17" unit="mmHg" />
          <DataPill label="Pachymetrie" value="545" unit="µm" tone="blue" />
          <DataPill label="Refractie" value="−2,25" tone="violet" />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          <DataPill size="sm" icon={<Icon name="user" />} label="Geboren" value="12-03-1958" />
          <DataPill size="sm" icon={<Icon name="calendar" />} label="Laatste bezoek" value="16 jan" />
          <DataPill size="sm" icon={<Icon name="checkCircle" />} label="Status" value="In orde" tone="green" />
        </div>
      </CardContent>
    </Card>
  );
}
