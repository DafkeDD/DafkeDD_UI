"use client";
import { useState } from "react";
import { Avatar, Stack, Text } from "@dafke/ui";
import { HoldToConfirm, SwipeToDelete } from "@dafke/ui/motion";

const BEGIN = [
  { id: 1, naam: "Offerte De Vries Bouw", detail: "Verstuurd op 12 september" },
  { id: 2, naam: "Factuur 2026-0431", detail: "Vervalt over 8 dagen" },
  { id: 3, naam: "Intake Atelier Nord", detail: "Concept" },
];

export default function Demo() {
  const [rijen, setRijen] = useState(BEGIN);

  return (
    <Stack gap="xl" style={{ maxWidth: 440 }}>
      <Stack gap="sm">
        <Text variant="small" tone="muted">
          Veeg een rij naar links om hem te verwijderen.
        </Text>
        <Stack gap="xs">
          {rijen.map((rij) => (
            <SwipeToDelete key={rij.id} onDelete={() => setRijen((v) => v.filter((r) => r.id !== rij.id))}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                <Avatar name={rij.naam} size={30} square />
                <div style={{ display: "grid", minWidth: 0 }}>
                  <Text variant="small" weight="semibold">
                    {rij.naam}
                  </Text>
                  <Text variant="small" tone="muted">
                    {rij.detail}
                  </Text>
                </div>
              </div>
            </SwipeToDelete>
          ))}
          {rijen.length === 0 && (
            <Text variant="small" tone="muted">
              Alles weg. Herlaad de pagina voor een nieuwe lijst.
            </Text>
          )}
        </Stack>
      </Stack>

      <Stack gap="sm">
        <Text variant="small" tone="muted">
          Of houd de knop even ingedrukt in plaats van een dialoog te openen.
        </Text>
        <HoldToConfirm
          icon="trash"
          onConfirm={() => setRijen([])}
          holdingLabel="Blijf vasthouden…"
          doneLabel="Alles gewist"
          style={{ alignSelf: "flex-start" }}
        >
          Alles verwijderen
        </HoldToConfirm>
      </Stack>
    </Stack>
  );
}
