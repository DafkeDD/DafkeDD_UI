"use client";
import { Meter, Stack } from "@dafke/ui";

export default function Demo() {
  return (
    <Stack gap="lg" style={{ maxWidth: 420 }}>
      <Meter value={68} label="Opslag" valueLabel="68 GB van 100 GB" />

      <Meter
        value={87}
        label="CPU-belasting"
        unit="%"
        thresholds={[
          { from: 0, tone: "green" },
          { from: 60, tone: "amber" },
          { from: 85, tone: "red" },
        ]}
      />

      <Meter
        value={42}
        min={0}
        max={60}
        label="Antwoordtijd"
        unit=" min"
        tone="accent"
        marker={30}
        markerLabel="doel"
        size="lg"
      />

      <Meter value={12} label="Fouten vandaag" unit="" tone="green" size="sm" />
    </Stack>
  );
}
