"use client";
import { useState } from "react";
import { Alert, Button } from "@dafke/ui";

export default function Demo() {
  const [zichtbaar, setZichtbaar] = useState(true);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Alert title="Onderhoud gepland">
        Zondag 24 augustus tussen 02:00 en 04:00 is het platform kort onbereikbaar.
      </Alert>
      <Alert tone="green" title="Betaling ontvangen">Factuur 2026-0481 is volledig betaald.</Alert>
      <Alert tone="amber" title="Licentie verloopt binnenkort" action={<Button size="sm" variant="secondary">Verlengen</Button>}>
        Nog 7 dagen geldig voor 12 gebruikers.
      </Alert>
      <Alert tone="red" title="Synchronisatie mislukt">Controleer de API-sleutel van deze tenant.</Alert>
      {zichtbaar && (
        <Alert tone="blue" title="Nieuw in de marketplace" onDismiss={() => setZichtbaar(false)}>
          De app "Roster" is vanaf vandaag beschikbaar.
        </Alert>
      )}
    </div>
  );
}
