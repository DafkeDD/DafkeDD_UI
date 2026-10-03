"use client";
import { Gauge, Row } from "@dafke/ui";

export default function Demo() {
  return (
    <Row gap="xl" wrap align="center">
      <Gauge value={72} label="Tevredenheid" unit="%" showBounds />
      <Gauge
        value={91}
        label="Schijfruimte"
        unit="%"
        thresholds={[
          { from: 0, tone: "green" },
          { from: 70, tone: "amber" },
          { from: 88, tone: "red" },
        ]}
        target={80}
      />
      <Gauge value={4.6} min={0} max={5} size={150} sweep={180} label="Beoordeling" tone="amber" />
    </Row>
  );
}
