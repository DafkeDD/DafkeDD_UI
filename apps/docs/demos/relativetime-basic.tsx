"use client";
import { DirectionProvider, Input, RelativeTime, Stack, Text } from "@dafke/ui";

const NU = Date.now();
const MOMENTEN = [
  { label: "Net", value: NU - 4_000 },
  { label: "Minuten", value: NU - 14 * 60_000 },
  { label: "Uren", value: NU - 5 * 3_600_000 },
  { label: "Gisteren", value: NU - 26 * 3_600_000 },
  { label: "Vorige week", value: NU - 9 * 86_400_000 },
  { label: "Straks", value: NU + 45 * 60_000 },
];

export default function Demo() {
  return (
    <Stack gap="xl" style={{ maxWidth: 420 }}>
      <Stack gap="xs">
        {MOMENTEN.map((moment) => (
          <div key={moment.label} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <Text variant="small" tone="muted">
              {moment.label}
            </Text>
            <RelativeTime value={moment.value} />
          </div>
        ))}
      </Stack>

      <Stack gap="xs">
        <Text variant="eyebrow">Rechts naar links</Text>
        <DirectionProvider dir="rtl">
          <Input placeholder="مرحبا" defaultValue="نص تجريبي" />
        </DirectionProvider>
        <Text variant="small" tone="muted">
          Dezelfde Input, maar met dir=&quot;rtl&quot;: de componenten gebruiken
          logische CSS-eigenschappen, dus ze spiegelen mee.
        </Text>
      </Stack>
    </Stack>
  );
}
