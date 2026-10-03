"use client";
import { Icon, ScrollArea } from "@dafke/ui";

const REGELS = [
  "08:30 — Intake Ahmed Bakkali",
  "09:00 — Controle Jan Peeters",
  "09:30 — Nazorg Marie Dubois",
  "10:00 — Telefonisch consult",
  "10:30 — Cataractcontrole",
  "11:00 — Voorschrift verlengen",
  "11:30 — Overleg labo",
  "13:30 — Nieuwe patiënt",
  "14:00 — Controle OD",
  "14:30 — Verslag dicteren",
  "15:00 — Gezichtsveldonderzoek",
  "15:30 — Afsluiting dossiers",
];

export default function Demo() {
  return (
    <ScrollArea
      height={220}
      style={{
        width: "100%", maxWidth: 380, padding: "6px 12px",
        border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)",
      }}
    >
      {REGELS.map((regel) => (
        <div
          key={regel}
          style={{
            display: "flex", alignItems: "center", gap: 9, padding: "10px 2px",
            borderBottom: "1px solid var(--border)", fontSize: 13,
          }}
        >
          <Icon name="clock" size={14} />
          {regel}
        </div>
      ))}
    </ScrollArea>
  );
}
