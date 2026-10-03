"use client";
import { useState } from "react";
import { Button, CookieConsent, Stack, Text, type CookieConsentValue } from "@dafke/ui";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [keuze, setKeuze] = useState<CookieConsentValue | null>(null);

  return (
    <Stack gap="md">
      <Button onClick={() => setOpen(true)} style={{ alignSelf: "flex-start" }}>
        Toestemmingsbalk tonen
      </Button>

      {keuze && (
        <Text variant="small" tone="muted">
          Keuze:{" "}
          {Object.entries(keuze)
            .map(([sleutel, aan]) => `${sleutel}: ${aan ? "ja" : "nee"}`)
            .join(" · ")}
        </Text>
      )}

      <CookieConsent
        open={open}
        onOpenChange={setOpen}
        onDecision={setKeuze}
        policyHref="#"
        /* In deze demo niets bewaren, zodat de balk telkens opnieuw kan. */
        storageKey={null}
      />
    </Stack>
  );
}
