"use client";
import { useState } from "react";
import {
  Avatar, Badge, Button, Icon, ListRow, RowIcon, RowList,
} from "@dafke/ui";

const AGENDA = [
  { tijd: "09:00", naam: "Lisa Vanreppelen", reden: "Controle · diabetische retinopathie", status: "klaar" },
  { tijd: "09:30", naam: "Jean-Pierre Dewitte", reden: "Pre-op cataract OD — biometrie", status: "bezig" },
  { tijd: "10:15", naam: "Nadia Peeters", reden: "Strabismus controle — pediatrie", status: "wacht" },
  { tijd: "11:00", naam: "Karim El Khattabi", reden: "Refractie + visus", status: "wacht" },
];

const TONEN = { klaar: "green", bezig: "accent", wacht: "neutral" } as const;

const DOCS = [
  { titel: "Verwijsbrief retinaspecialist", meta: "Dr. M. Verbruggen · 18 apr", type: "brief", concept: false },
  { titel: "OCT-verslag macula OD", meta: "Automatisch gegenereerd · 17 apr", type: "verslag", concept: true },
  { titel: "Voorschrift Latanoprost", meta: "Apotheek De Wilg · 16 apr", type: "recept", concept: false },
];

export default function Demo() {
  const [gekozen, setGekozen] = useState("Verwijsbrief retinaspecialist");

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <RowList bordered>
        {AGENDA.map((rij) => (
          <ListRow
            key={rij.tijd}
            clickable
            lead={rij.tijd}
            leading={<Avatar name={rij.naam} size={34} />}
            title={rij.naam}
            subtitle={rij.reden}
            accent={rij.status === "bezig" ? "var(--accent)" : undefined}
            trailing={<Badge tone={TONEN[rij.status as keyof typeof TONEN]} dot>{rij.status}</Badge>}
            actions={<Button size="sm" variant="ghost" icon={<Icon name="more" />} aria-label="Meer" />}
          />
        ))}
      </RowList>

      <RowList separated>
        {DOCS.map((doc) => (
          <ListRow
            key={doc.titel}
            clickable
            selected={gekozen === doc.titel}
            onClick={() => setGekozen(doc.titel)}
            leading={
              <RowIcon tone={doc.type === "recept" ? "violet" : "blue"} square>
                <Icon name={doc.type === "recept" ? "file" : "mail"} />
              </RowIcon>
            }
            title={doc.titel}
            subtitle={doc.meta}
            trailing={doc.concept ? <Badge tone="amber">concept</Badge> : undefined}
            actions={
              <Button size="sm" variant={doc.concept ? "secondary" : "ghost"}>
                {doc.concept ? "Afwerken" : "Bekijken"}
              </Button>
            }
          />
        ))}
      </RowList>
    </div>
  );
}
