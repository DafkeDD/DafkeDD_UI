"use client";
import { useState } from "react";
import { Card, CardContent, Chip, Composer, Icon } from "@dafke/ui";

export default function Demo() {
  const [regels, setRegels] = useState<string[]>([]);
  const [wanneer, setWanneer] = useState("Vandaag");

  return (
    <Card>
      <CardContent style={{ display: "grid", gap: 14 }}>
        <Composer
          onSubmit={(tekst) => setRegels((vorige) => [`${tekst} · ${wanneer}`, ...vorige])}
          placeholder="Wat moet er gebeuren?"
        >
          {["Vandaag", "Morgen", "Deze week"].map((keuze) => (
            <Chip key={keuze} size="sm" selected={wanneer === keuze} onClick={() => setWanneer(keuze)}>
              <Icon name="calendar" size={13} />
              {keuze}
            </Chip>
          ))}
        </Composer>

        {regels.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            Typ iets en druk op Enter — of gebruik de microfoon als je browser spraak ondersteunt.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, display: "grid", gap: 6 }}>
            {regels.map((regel, index) => (
              <li key={index}>{regel}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
