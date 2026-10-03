"use client";
import { Spinner } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Spinner size={14} />
      <Spinner size={20} />
      <span style={{ color: "var(--accent)" }}><Spinner size={28} /></span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 14, color: "var(--text-2)" }}>
        <Spinner label="Laden" /> Gegevens ophalen…
      </span>
    </>
  );
}
