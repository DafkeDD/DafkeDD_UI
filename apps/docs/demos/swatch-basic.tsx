"use client";
import { useState } from "react";
import { Card, CardContent, SwatchPicker } from "@dafke/ui";

const TOKENS = ["var(--accent)", "var(--violet)", "var(--green)", "var(--amber)", "var(--red)", "var(--blue)"];

export default function Demo() {
  const [rond, setRond] = useState(TOKENS[0]);
  const [vierkant, setVierkant] = useState(TOKENS[2]);

  return (
    <Card>
      <CardContent style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Rond, met eigen kleur</span>
          <SwatchPicker colors={TOKENS} value={rond} onValueChange={setRond} allowCustom />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>Vierkant en groter</span>
          <SwatchPicker colors={TOKENS} value={vierkant} onValueChange={setVierkant} square size={34} />
        </div>

        <div style={{ fontSize: 13, color: "var(--text-3)" }}>
          Gekozen: <code>{rond}</code> en <code>{vierkant}</code>
        </div>
      </CardContent>
    </Card>
  );
}
