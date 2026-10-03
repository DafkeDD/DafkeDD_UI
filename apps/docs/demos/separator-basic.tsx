"use client";
import { Separator } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Separator />
      <Separator label="of" />
      <div style={{ display: "flex", alignItems: "center", gap: 14, height: 24, fontSize: 14, color: "var(--text-2)" }}>
        <span>Profiel</span>
        <Separator orientation="vertical" />
        <span>Facturen</span>
        <Separator orientation="vertical" />
        <span>Tickets</span>
      </div>
    </div>
  );
}
