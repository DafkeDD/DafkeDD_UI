"use client";
import { useState } from "react";
import { Avatar, Button, Icon, Indicator } from "@dafke/ui";

export default function Demo() {
  const [aantal, setAantal] = useState(3);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
      <Indicator badge={aantal} hidden={aantal === 0} label={`${aantal} nieuwe meldingen`}>
        <Button variant="secondary" icon={<Icon name="bell" />} aria-label="Meldingen" />
      </Indicator>

      <Indicator badge={128} max={99} tone="accent">
        <Button variant="secondary" icon={<Icon name="mail" />} aria-label="Berichten" />
      </Indicator>

      <Indicator dot pulse tone="green" placement="bottom-right">
        <Avatar name="Jan Peeters" size={40} />
      </Indicator>

      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="secondary" onClick={() => setAantal((n) => n + 1)}>
          Melding erbij
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setAantal(0)}>
          Alles gelezen
        </Button>
      </div>
    </div>
  );
}
