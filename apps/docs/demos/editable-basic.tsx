"use client";
import { useState } from "react";
import { Editable, Stack, Text } from "@dafke/ui";

export default function Demo() {
  const [titel, setTitel] = useState("Kwartaalrapport Q3");
  const [notitie, setNotitie] = useState("");

  return (
    <Stack gap="lg" style={{ maxWidth: 440 }}>
      <div>
        <Text variant="eyebrow" style={{ marginBottom: 4 }}>
          Titel
        </Text>
        <Editable value={titel} onValueChange={setTitel} size="lg" label="Titel" />
      </div>

      <div>
        <Text variant="eyebrow" style={{ marginBottom: 4 }}>
          Notitie
        </Text>
        <Editable
          value={notitie}
          onValueChange={setNotitie}
          multiline
          showActions
          submitOnBlur={false}
          placeholder="Nog geen notitie"
          label="Notitie"
        />
        <Text variant="small" tone="muted" style={{ marginTop: 6 }}>
          Meerdere regels: bevestigen met Cmd/Ctrl + Enter, Escape annuleert.
        </Text>
      </div>
    </Stack>
  );
}
