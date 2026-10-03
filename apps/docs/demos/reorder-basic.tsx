"use client";
import { useState } from "react";
import { Badge, Icon } from "@dafke/ui";
import { ReorderList, ReorderListItem } from "@dafke/ui/motion";

interface Taak {
  id: string;
  titel: string;
  tijd: string;
  urgent?: boolean;
}

const START: Taak[] = [
  { id: "1", titel: "Dossier Peeters nakijken", tijd: "09:00", urgent: true },
  { id: "2", titel: "Bloedresultaten doorbellen", tijd: "10:30" },
  { id: "3", titel: "Voorschrift verlengen", tijd: "11:15" },
  { id: "4", titel: "Verslag cataractcontrole", tijd: "14:00" },
];

export default function Demo() {
  const [taken, setTaken] = useState(START);

  return (
    <div style={{ width: "100%", maxWidth: 460 }}>
      <ReorderList values={taken} onReorder={setTaken}>
        {taken.map((taak) => (
          <ReorderListItem key={taak.id} value={taak} handle>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 550 }}>{taak.titel}</span>
              {taak.urgent && <Badge tone="red" size="sm">urgent</Badge>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--text-3)" }}>
                <Icon name="clock" size={13} />
                {taak.tijd}
              </span>
            </span>
          </ReorderListItem>
        ))}
      </ReorderList>
      <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-3)" }}>
        Volgorde: {taken.map((taak) => taak.tijd).join(" · ")}
      </p>
    </div>
  );
}
