"use client";
import { useState } from "react";
import { SearchField, Stack, Text } from "@dafke/ui";

export default function Demo() {
  const [gezocht, setGezocht] = useState<string | null>(null);

  return (
    <Stack gap="md" align="center" style={{ padding: "28px 0 40px" }}>
      <SearchField expandable placeholder="Zoek iets…" onSearch={setGezocht} />
      <Text variant="small" tone="muted" align="center">
        Klik het rondje: het schuift vanuit zichzelf open, met de cursor er
        meteen in. Escape of een klik ernaast klapt het weer dicht.
        {gezocht ? ` Gezocht op: ${gezocht}` : ""}
      </Text>
    </Stack>
  );
}
