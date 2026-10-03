"use client";
import { useState } from "react";
import { ApprovalCard, Stack, ToolCall } from "@dafke/ui";

export default function Demo() {
  const [besluit, setBesluit] = useState<"approved" | "denied" | null>(null);

  return (
    <Stack gap="md" style={{ maxWidth: 560 }}>
      <ToolCall
        name="zoek_klant"
        status="success"
        summary="3 resultaten"
        duration={412}
        input={{ query: "De Vries", limiet: 5 }}
        output={[
          { id: 1, naam: "De Vries Bouw", plaats: "Gent" },
          { id: 2, naam: "De Vries & Zn", plaats: "Aalst" },
        ]}
      />

      <ToolCall name="genereer_rapport" status="running" summary="bezig met samenvatten…" />

      <ToolCall
        name="stuur_mail"
        status="error"
        duration={1840}
        input={{ aan: "info@devriesbouw.be" }}
        error="SMTP weigerde de verbinding (535 authenticatie mislukt)."
      />

      <ApprovalCard
        title="Bestand wegschrijven naar je map"
        description="Het model wil een bestand aanmaken in een map die je gedeeld hebt."
        details={[
          { label: "Pad", value: "~/Documenten/offertes/2026-09.csv" },
          { label: "Grootte", value: "12,4 kB" },
          { label: "Actie", value: "aanmaken" },
        ]}
        allowAlways
        decision={besluit}
        onApprove={() => setBesluit("approved")}
        onDeny={() => setBesluit("denied")}
      />
    </Stack>
  );
}
