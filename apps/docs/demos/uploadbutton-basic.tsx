"use client";
import { UploadButton } from "@dafke/ui/motion";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center", width: "100%" }}>
      <UploadButton accept=".pdf,.png,.jpg" />
      <span style={{ fontSize: 12, color: "var(--text-3)" }}>
        Kies een bestand en klik op Uploaden — zonder onUpload loopt er een nep-voortgang.
      </span>
    </div>
  );
}
