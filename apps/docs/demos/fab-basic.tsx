"use client";
import { useState } from "react";
import { Fab, Icon, SpeedDial, SpeedDialAction } from "@dafke/ui";

export default function Demo() {
  const [laatste, setLaatste] = useState<string>();

  return (
    <div
      style={{
        position: "relative", transform: "translateZ(0)", width: "100%", height: 260,
        border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface-2)",
        padding: 16,
      }}
    >
      <p style={{ fontSize: 13, color: "var(--text-2)" }}>
        {laatste ? `Gekozen: ${laatste}` : "De knoppen hangen rechtsonder en linksonder in dit kader."}
      </p>

      <Fab position="bottom-left" icon={<Icon name="plus" />} onClick={() => setLaatste("Nieuwe afspraak")}>
        Afspraak
      </Fab>

      <SpeedDial position="bottom-right">
        <SpeedDialAction icon={<Icon name="user" />} label="Patiënt" onClick={() => setLaatste("Patiënt")} />
        <SpeedDialAction icon={<Icon name="calendar" />} label="Afspraak" onClick={() => setLaatste("Afspraak")} />
        <SpeedDialAction icon={<Icon name="file" />} label="Verslag" onClick={() => setLaatste("Verslag")} />
      </SpeedDial>
    </div>
  );
}
