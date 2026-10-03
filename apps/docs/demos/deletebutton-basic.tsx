"use client";
import { useState } from "react";
import { Badge } from "@dafke/ui";
import { DeleteButton } from "@dafke/ui/motion";

export default function Demo() {
  const [status, setStatus] = useState("Niets verwijderd.");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <DeleteButton onDeleted={() => setStatus("Dossier verwijderd.")}>Verwijderen</DeleteButton>
      <DeleteButton tone="soft" deletedLabel="Leeg">
        Lijst wissen
      </DeleteButton>
      <Badge tone="neutral">{status}</Badge>
    </div>
  );
}
