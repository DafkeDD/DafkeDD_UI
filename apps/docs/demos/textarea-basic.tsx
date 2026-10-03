"use client";
import { Field, Textarea } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 460 }}>
      <Field label="Interne notitie" hint="Alleen zichtbaar voor beheerders.">
        <Textarea placeholder="Schrijf een notitie…" />
      </Field>
      <Field label="Meegroeiend veld">
        <Textarea autoResize rows={2} placeholder="Typ meerdere regels en het veld groeit mee…" />
      </Field>
    </div>
  );
}
