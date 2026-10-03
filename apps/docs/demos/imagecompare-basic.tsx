"use client";
import { ImageCompare, Stack, Text } from "@dafke/ui";

/** Twee varianten van dezelfde tekening: licht en donker. */
function paneel(achtergrond: string, kaart: string, tekst: string, lijn: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="${achtergrond}"/>
    <rect x="40" y="40" width="300" height="120" rx="14" fill="${kaart}"/>
    <rect x="64" y="70" width="150" height="14" rx="7" fill="${tekst}"/>
    <rect x="64" y="98" width="230" height="10" rx="5" fill="${lijn}"/>
    <rect x="64" y="118" width="190" height="10" rx="5" fill="${lijn}"/>
    <rect x="40" y="184" width="720" height="226" rx="14" fill="${kaart}"/>
    <rect x="64" y="214" width="180" height="14" rx="7" fill="${tekst}"/>
    <rect x="64" y="248" width="672" height="10" rx="5" fill="${lijn}"/>
    <rect x="64" y="272" width="600" height="10" rx="5" fill="${lijn}"/>
    <rect x="64" y="296" width="640" height="10" rx="5" fill="${lijn}"/>
    <rect x="64" y="340" width="120" height="34" rx="9" fill="#14b8a6"/>
    <rect x="380" y="40" width="380" height="120" rx="14" fill="${kaart}"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const LICHT = paneel("#f8fafc", "#ffffff", "#0f172a", "#e2e8f0");
const DONKER = paneel("#0b1120", "#131c31", "#e2e8f0", "#233048");

export default function Demo() {
  return (
    <Stack gap="lg">
      <ImageCompare
        before={LICHT}
        after={DONKER}
        beforeAlt="Licht thema"
        afterAlt="Donker thema"
        beforeLabel="Licht"
        afterLabel="Donker"
      />
      <Text variant="small" tone="muted">
        Sleep de schuif, of geef hem focus en gebruik de pijltjes — Shift maakt
        grotere stappen, Home en End springen naar de uiteinden.
      </Text>
    </Stack>
  );
}
