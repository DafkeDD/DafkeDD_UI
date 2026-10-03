"use client";
import { useState } from "react";
import { Badge } from "@dafke/ui";
import { SendButton } from "@dafke/ui/motion";

export default function Demo() {
  const [laatste, setLaatste] = useState("Nog niets verstuurd.");

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <SendButton onSent={() => setLaatste("Bericht verstuurd.")}>Versturen</SendButton>
      <SendButton
        resetAfter={false}
        onSend={async () => {
          await new Promise((klaar) => setTimeout(klaar, 700));
          return false;
        }}
      >
        Mislukt versturen
      </SendButton>
      <Badge tone="neutral">{laatste}</Badge>
    </div>
  );
}
