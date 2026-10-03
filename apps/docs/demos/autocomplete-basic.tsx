"use client";
import { useState } from "react";
import { Autocomplete, Field, Icon, Stack, Text } from "@dafke/ui";

const STEDEN = [
  { value: "Antwerpen", description: "België" },
  { value: "Amsterdam", description: "Nederland" },
  { value: "Aalst", description: "België" },
  { value: "Brugge", description: "België" },
  { value: "Brussel", description: "België" },
  { value: "Gent", description: "België" },
  { value: "Hasselt", description: "België" },
  { value: "Leuven", description: "België" },
  { value: "Luik", description: "België" },
  { value: "Rotterdam", description: "Nederland" },
  { value: "Utrecht", description: "Nederland" },
];

export default function Demo() {
  const [stad, setStad] = useState("");

  return (
    <Stack gap="md" style={{ maxWidth: 340 }}>
      <Field label="Stad" hint="Typ vrij of kies een voorstel.">
        <Autocomplete
          value={stad}
          onValueChange={setStad}
          options={STEDEN}
          placeholder="Bv. Gent"
          prefix={<Icon name="search" size={16} />}
          maxResults={6}
        />
      </Field>
      <Text variant="small" tone="muted">
        Waarde: {stad || "—"}
      </Text>
    </Stack>
  );
}
