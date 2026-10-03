"use client";
import { Badge, Card, Masonry, Text } from "@dafke/ui";

const ITEMS = [
  { titel: "Tokens", hoogte: 96, tekst: "Kleur, ruimte en radius komen uit één bestand.", tone: "accent" as const },
  { titel: "Dichtheid", hoogte: 150, tekst: "Eén variabele schaalt de hoogte van elk veld mee, van compact tot ruim. Handig voor schermen die de hele dag openstaan.", tone: "blue" as const },
  { titel: "Donker", hoogte: 70, tekst: "Via data-theme.", tone: "violet" as const },
  { titel: "Registry", hoogte: 130, tekst: "Eén JSON per component, met de bestanden erin. De CLI kopieert ze naar je project.", tone: "green" as const },
  { titel: "Geen dependencies", hoogte: 108, tekst: "Eigen cn, variants, Slot en Portal — niets van buiten.", tone: "amber" as const },
  { titel: "Toetsenbord", hoogte: 86, tekst: "Elk overlay-component heeft focusbeheer.", tone: "red" as const },
  { titel: "i18n", hoogte: 120, tekst: "De documentatie staat in vier talen; de componenten zelf zijn taalvrij.", tone: "neutral" as const },
  { titel: "Motion", hoogte: 78, tekst: "Optionele laag op framer-motion.", tone: "violet" as const },
];

export default function Demo() {
  return (
    <Masonry columns={{ 0: 1, 560: 2, 900: 3 }} gap={14} balanced>
      {ITEMS.map((item) => (
        <Card key={item.titel} style={{ padding: 14, minHeight: item.hoogte }}>
          <span>
            <Badge tone={item.tone} size="sm">
              {item.titel}
            </Badge>
          </span>
          <Text variant="small" tone="muted" style={{ marginTop: 8 }}>
            {item.tekst}
          </Text>
        </Card>
      ))}
    </Masonry>
  );
}
