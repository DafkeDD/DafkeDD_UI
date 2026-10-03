"use client";
import { useState } from "react";
import { Field, TimeField, TimeRangeField, formatTime, type TimeRangeValue } from "@dafke/ui";

export default function Demo() {
  const [start, setStart] = useState<number | null>(9 * 60);
  const [shift, setShift] = useState<TimeRangeValue>({ start: 8 * 60 + 30, end: 17 * 60 });

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 460 }}>
      <Field
        label="Starttijd"
        hint={`Typ "9", "930" of "9:30" — alles wordt begrepen. Pijltjes ↑↓ springen per 15 minuten. Nu: ${
          start == null ? "leeg" : formatTime(start)
        }`}
      >
        <TimeField value={start} onValueChange={setStart} min={7 * 60} max={20 * 60} />
      </Field>

      <Field label="Dienst" hint="De eindtijd schuift automatisch mee als hij vóór de start valt.">
        <TimeRangeField value={shift} onValueChange={setShift} step={30} />
      </Field>

      <Field label="Zonder suggesties">
        <TimeField suggestions={false} size="sm" placeholder="uu:mm" />
      </Field>
    </div>
  );
}
