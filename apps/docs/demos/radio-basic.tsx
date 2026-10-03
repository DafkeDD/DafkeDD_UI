"use client";
import { Radio, RadioGroup } from "@dafke/ui";

export default function Demo() {
  return (
    <RadioGroup defaultValue="maand" style={{ maxWidth: 420 }}>
      <Radio value="maand" label="Maandelijks" description="€ 29 per gebruiker, maandelijks opzegbaar." />
      <Radio value="jaar" label="Jaarlijks" description="€ 290 per gebruiker, twee maanden gratis." />
      <Radio value="offerte" label="Op offerte" disabled description="Vanaf 250 gebruikers." />
    </RadioGroup>
  );
}
