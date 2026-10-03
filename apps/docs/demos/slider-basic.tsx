"use client";
import { useState } from "react";
import { Field, Slider } from "@dafke/ui";

export default function Demo() {
  const [seats, setSeats] = useState(24);

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 420 }}>
      <Field label="Aantal licenties">
        <Slider value={seats} onValueChange={setSeats} min={1} max={100} showValue format={(v) => `${v} seats`} />
      </Field>
      <Slider defaultValue={70} tone="green" showValue format={(v) => `${v}%`} />
      <Slider defaultValue={40} tone="red" disabled />
    </div>
  );
}
