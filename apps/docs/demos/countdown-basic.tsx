"use client";
import { useEffect, useState } from "react";
import { Badge, Countdown } from "@dafke/ui";

// Een vast moment: hetzelfde op de server en in de browser, dus geen verschil
// tussen de HTML van de server en die van de client.
const DEADLINE = "2026-12-24T18:00:00.000Z";

export default function Demo() {
  const [bijna, setBijna] = useState<number | null>(null);
  const [klaar, setKlaar] = useState(false);

  // Deze teller moet wél kort op de klok van de bezoeker staan; daarom pas
  // bepalen zodra we in de browser zijn.
  useEffect(() => setBijna(Date.now() + 12_000), []);

  return (
    <div style={{ display: "grid", gap: 20, justifyItems: "center" }}>
      <Countdown to={DEADLINE} variant="cards" />
      <Countdown to={DEADLINE} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34 }}>
        {bijna !== null && (
          <Countdown to={bijna} compact showDays={false} onComplete={() => setKlaar(true)} />
        )}
        {klaar && <Badge tone="green" size="sm">tijd om</Badge>}
      </div>
    </div>
  );
}
