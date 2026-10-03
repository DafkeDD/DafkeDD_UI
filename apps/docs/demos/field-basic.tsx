"use client";
import { Badge, Field, Input } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 440 }}>
      <Field label="Bedrijfsnaam" required hint="Zoals vermeld in de KBO.">
        <Input placeholder="ITWORXS BV" />
      </Field>
      <Field label="Ondernemingsnummer" labelAction={<Badge size="sm">optioneel</Badge>}>
        <Input placeholder="BE 0123.456.789" />
      </Field>
      <Field label="E-mailadres" error="Vul een geldig e-mailadres in.">
        <Input defaultValue="jan.janssens@" />
      </Field>
      <Field label="Land" disabled hint="Wordt afgeleid uit je ondernemingsnummer.">
        <Input defaultValue="België" />
      </Field>
    </div>
  );
}
