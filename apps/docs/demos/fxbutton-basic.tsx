"use client";
import { FxButton, Text, type FxEffect } from "@dafke/ui";

const KNOPPEN: Array<{ effect: FxEffect; label: string; hoverLabel?: string; naam: string }> = [
  { effect: "typewriter", label: "Quantum", hoverLabel: "Klaar voor start", naam: "Typemachine" },
  { effect: "rocket", label: "Lanceren", naam: "Raket" },
  { effect: "swap", label: "Uitrollen", naam: "Icoonwissel" },
  { effect: "spark", label: "Ontsteken", naam: "Vonk" },
  { effect: "circle", label: "Nebula", naam: "Cirkel" },
  { effect: "shine", label: "Supernova", naam: "Glans" },
  { effect: "flip", label: "Versturen", hoverLabel: "Ontvangen", naam: "Omslag" },
  { effect: "expand", label: "Fusie", naam: "Uitschuiven" },
  { effect: "badge", label: "Kosmos", naam: "Badge" },
  { effect: "warp", label: "Activeren", naam: "Warp" },
];

export default function Demo() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
        gap: 12,
      }}
    >
      {KNOPPEN.map((knop, index) => (
        <div
          key={knop.effect}
          style={{
            display: "grid",
            gap: 12,
            justifyItems: "center",
            padding: "12px 10px 18px",
            border: "1px solid var(--border)",
            borderRadius: 12,
            background: "var(--surface)",
          }}
        >
          <Text variant="caption" tone="muted" style={{ justifySelf: "start" }}>
            {index + 1} · {knop.naam}
          </Text>
          <FxButton effect={knop.effect} hoverLabel={knop.hoverLabel} tone={index % 3 === 1 ? "violet" : "accent"}>
            {knop.label}
          </FxButton>
        </div>
      ))}
    </div>
  );
}
