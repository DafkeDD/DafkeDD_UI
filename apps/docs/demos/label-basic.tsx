"use client";
import { Input, Label } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 7, maxWidth: 360 }}>
      <Label htmlFor="demo-label-input" required>
        Volledige naam
      </Label>
      <Input id="demo-label-input" placeholder="Davey Verhoeven" />
    </div>
  );
}
