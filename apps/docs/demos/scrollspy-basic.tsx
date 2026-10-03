"use client";
import { useRef } from "react";
import { Scrollspy, Text } from "@dafke/ui";

const SECTIES = [
  { id: "spy-intro", label: "Inleiding" },
  { id: "spy-install", label: "Installatie" },
  { id: "spy-cli", label: "Met de CLI", level: 2 },
  { id: "spy-hand", label: "Met de hand", level: 2 },
  { id: "spy-thema", label: "Thema" },
  { id: "spy-faq", label: "Veelgestelde vragen" },
];

export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 20 }}>
      <div
        ref={scroller}
        style={{
          height: 280,
          overflowY: "auto",
          padding: "4px 12px 140px",
          border: "1px solid var(--border)",
          borderRadius: 10,
        }}
      >
        {SECTIES.map((sectie) => (
          <section key={sectie.id} id={sectie.id} style={{ paddingTop: 16 }}>
            <Text variant="h3" style={{ margin: "0 0 6px" }}>
              {sectie.label}
            </Text>
            <Text variant="small" tone="muted">
              Scroll door dit paneel: het overzicht rechts volgt mee en markeert
              de zichtbare sectie. Elke titel krijgt genoeg tekst om de
              waarnemer te laten werken, zodat de markering duidelijk verspringt
              terwijl je leest.
            </Text>
          </section>
        ))}
      </div>

      <Scrollspy items={SECTIES} title="Op deze pagina" root={scroller} offset={8} />
    </div>
  );
}
