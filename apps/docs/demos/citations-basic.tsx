"use client";
import { Button, Citations, CitationMark, Stack, UsageQuota } from "@dafke/ui";

const BRONNEN = [
  {
    id: "kb",
    title: "Handboek interne processen",
    source: "intranet · hoofdstuk 4",
    snippet: "Offertes blijven dertig kalenderdagen geldig, tenzij anders vermeld op het document zelf.",
  },
  {
    id: "mail",
    title: "Mail van Annelies Peeters",
    source: "12 september 2026",
    snippet: "We hanteren vanaf oktober 84 euro per uur voor nieuwe dossiers.",
  },
  {
    id: "wet",
    title: "Wetboek economisch recht, boek VI",
    source: "ejustice.fgov.be",
    url: "https://www.ejustice.just.fgov.be",
  },
];

export default function Demo() {
  return (
    <Stack gap="xl" style={{ maxWidth: 580 }}>
      <Citations sources={BRONNEN}>
        {"Een offerte blijft dertig dagen geldig"}
        <CitationMark id="kb" />
        {" en het uurtarief gaat vanaf oktober naar 84 euro"}
        <CitationMark id="mail" />
        {". Voor consumenten geldt daarbovenop het herroepingsrecht van veertien dagen"}
        <CitationMark id="wet" />
        {"."}
      </Citations>

      <UsageQuota
        used={1840}
        limit={2000}
        label="Berichten deze maand"
        resetAt="2026-10-01T00:00:00"
        action={
          <Button size="sm" variant="secondary">
            Upgraden
          </Button>
        }
      />

      <UsageQuota used={312} limit={5000} label="API-oproepen" compact />
    </Stack>
  );
}
