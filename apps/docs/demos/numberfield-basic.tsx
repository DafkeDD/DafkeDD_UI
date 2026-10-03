"use client";
import { useState } from "react";
import { Field, NumberField, Stack } from "@dafke/ui";

export default function Demo() {
  const [aantal, setAantal] = useState<number | null>(3);

  return (
    <Stack gap="md" style={{ maxWidth: 280 }}>
      <Field label="Aantal licenties" hint="Pijltjes stappen per 1, PageUp per 10.">
        <NumberField value={aantal} onValueChange={setAantal} min={1} max={250} />
      </Field>
      <Field label="Prijs per maand">
        <NumberField
          defaultValue={89.5}
          step={0.5}
          min={0}
          format={{ style: "currency", currency: "EUR" }}
        />
      </Field>
      <Field label="Gewicht">
        <NumberField defaultValue={72} step={0.1} unit="kg" size="sm" />
      </Field>
      <Field label="Zonder knoppen">
        <NumberField defaultValue={2026} hideSteppers min={1900} max={2100} />
      </Field>
    </Stack>
  );
}
