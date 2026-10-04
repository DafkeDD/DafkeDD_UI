"use client";
import { useState } from "react";
import { Button, EidStatus, type EidPhase } from "@dafke/ui";

// Altijd de nieuwste versie van het eID-programma (GitHub-release van DafkeDD_EID).
const DOWNLOADS = {
  windows: "https://github.com/DafkeDD/DafkeDD_EID/releases/latest/download/dafke-eid-setup-windows-x64.exe",
  mac: "https://github.com/DafkeDD/DafkeDD_EID/releases/latest/download/dafke-eid-macos-arm64",
};

const PHASES: EidPhase[] = ["connecting", "no-bridge", "bridge-outdated", "no-reader", "no-card", "ready", "reading", "done", "error"];

export default function Demo() {
  const [phase, setPhase] = useState<EidPhase>("no-bridge");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PHASES.map((value) => (
          <Button key={value} size="sm" variant={value === phase ? "primary" : "secondary"} onClick={() => setPhase(value)}>
            {value}
          </Button>
        ))}
      </div>
      <EidStatus
        phase={phase}
        reader={phase === "no-bridge" || phase === "no-reader" ? null : "Alcor Micro USB Smart Card Reader 0"}
        error={phase === "error" ? { code: "card-removed", message: "De kaart werd uit de lezer gehaald tijdens het lezen." } : null}
        downloads={DOWNLOADS}
        onRead={() => setPhase("reading")}
      />
    </div>
  );
}
