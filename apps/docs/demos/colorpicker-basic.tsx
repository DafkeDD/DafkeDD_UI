"use client";
import { useState } from "react";
import { ColorPicker, Row, Stack, Text } from "@dafke/ui";

export default function Demo() {
  const [kleur, setKleur] = useState("#3b82f6");

  return (
    <Row gap="lg" align="start" wrap>
      <ColorPicker value={kleur} onValueChange={setKleur} alpha />

      <Stack gap="sm">
        <div
          style={{
            width: 140,
            height: 88,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: kleur,
          }}
        />
        <Text variant="small" tone="muted">
          Waarde: {kleur.toUpperCase()}
        </Text>
      </Stack>
    </Row>
  );
}
