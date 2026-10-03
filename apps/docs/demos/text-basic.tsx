"use client";
import { Stack, Text } from "@dafke/ui";

export default function Demo() {
  return (
    <Stack gap="sm">
      <Text variant="eyebrow" tone="subtle">Dossier</Text>
      <Text variant="h2">Annelies Peeters</Text>
      <Text tone="muted">
        Eén component voor alle tekst: kopregels, lopende tekst en bijschriften, altijd met tokens.
      </Text>
      <Text variant="small" tone="accent" weight="semibold">Kleur via tone, gewicht via weight.</Text>
      <Text variant="mono" tone="subtle">RIZIV 1-23456-78-901</Text>
      <Text truncate style={{ maxWidth: 260 }}>
        Deze regel is te lang voor de beschikbare ruimte en wordt netjes afgekapt met puntjes.
      </Text>
      <Text lines={2} tone="muted" style={{ maxWidth: 360 }}>
        Met lines kap je af na een vast aantal regels. Deze tekst loopt door tot er drie regels zouden
        staan, maar stopt na twee en krijgt dan de drie puntjes van de browser.
      </Text>
    </Stack>
  );
}
