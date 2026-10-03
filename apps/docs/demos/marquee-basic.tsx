"use client";
import { Badge, Card, Icon, Marquee, Stack, Text } from "@dafke/ui";

const LOGOS = ["Antwerpen", "Gent", "Brugge", "Leuven", "Hasselt", "Kortrijk", "Mechelen", "Oostende"];

export default function Demo() {
  return (
    <Stack gap="xl">
      <Marquee fade duration={22}>
        {LOGOS.map((naam) => (
          <Card key={naam} style={{ padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="building" size={16} />
            <Text variant="small" weight="semibold">
              {naam}
            </Text>
          </Card>
        ))}
      </Marquee>

      <Marquee fade reverse duration={30}>
        {["Zorg", "Retail", "Bouw", "Onderwijs", "Logistiek", "Horeca", "Overheid"].map((sector) => (
          <Badge key={sector} tone="neutral">
            {sector}
          </Badge>
        ))}
      </Marquee>
    </Stack>
  );
}
