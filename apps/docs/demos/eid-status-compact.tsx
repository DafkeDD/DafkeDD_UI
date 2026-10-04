"use client";
import { EidStatus } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
      <EidStatus compact phase="no-card" />
      <EidStatus compact phase="reading" />
      <EidStatus compact phase="done" />
    </div>
  );
}
