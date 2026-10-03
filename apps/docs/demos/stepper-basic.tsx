"use client";
import { useState } from "react";
import { Button, Stepper } from "@dafke/ui";

const STAPPEN = [
  { label: "App kiezen", description: "Uit de marketplace" },
  { label: "Licenties", description: "Aantal seats" },
  { label: "Gegevens", description: "Facturatie" },
  { label: "Bevestigen" },
];

export default function Demo() {
  const [stap, setStap] = useState(1);

  return (
    <div style={{ display: "grid", gap: 26 }}>
      <Stepper steps={STAPPEN} current={stap} onStepClick={setStap} />
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="secondary" disabled={stap === 0} onClick={() => setStap(stap - 1)}>Vorige</Button>
        <Button disabled={stap === STAPPEN.length - 1} onClick={() => setStap(stap + 1)}>Volgende</Button>
      </div>
      <Stepper steps={STAPPEN.slice(0, 3)} current={1} orientation="vertical" />
    </div>
  );
}
