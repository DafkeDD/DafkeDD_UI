"use client";
import { useState } from "react";
import { SearchField, Stack, Text } from "@dafke/ui";

const VOORSTELLEN = [
  { value: "Dashboard", description: "Overzicht van vandaag" },
  { value: "Klanten", description: "Alle dossiers" },
  { value: "Facturen", description: "Openstaand en betaald" },
  { value: "Planning", description: "Week- en dagweergave" },
  { value: "Instellingen", description: "Team, thema en koppelingen" },
];

export default function Demo() {
  const [recent, setRecent] = useState(["Facturen", "De Vries Bouw", "Planning"]);
  const [gekozen, setGekozen] = useState<string | null>(null);

  const zoek = (waarde: string) => {
    setGekozen(waarde);
    setRecent((vorige) => [waarde, ...vorige.filter((item) => item !== waarde)].slice(0, 5));
  };

  return (
    <Stack gap="xl" style={{ paddingBottom: 150 }}>
      <Stack gap="sm">
        <Text variant="eyebrow">In de balk</Text>
        <SearchField
          suggestions={VOORSTELLEN}
          recent={recent}
          onRecentClear={() => setRecent([])}
          onSearch={zoek}
          shortcut="Ctrl K"
          placeholder="Zoek overal…"
          style={{ maxWidth: 460 }}
        />
        <Text variant="small" tone="muted">
          Druk ergens op de pagina op Ctrl+K (of ⌘K) om er meteen in te zitten.
          Gezocht op: {gekozen ?? "—"}
        </Text>
      </Stack>
    </Stack>
  );
}
