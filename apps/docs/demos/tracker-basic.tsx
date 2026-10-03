"use client";
import { Stack, Text, Tracker } from "@dafke/ui";

/** Vaste reeks, zodat server en client hetzelfde renderen. */
const DAGEN = Array.from({ length: 45 }, (_, index) => {
  const stoornis = index === 12 || index === 31;
  const traag = index === 13 || index === 24 || index === 38;
  return {
    tone: stoornis ? ("red" as const) : traag ? ("amber" as const) : ("green" as const),
    tooltip: stoornis
      ? `Dag ${index + 1}: storing, 42 min`
      : traag
        ? `Dag ${index + 1}: trage reacties`
        : `Dag ${index + 1}: alles in orde`,
    label: `Dag ${index + 1}`,
  };
});

export default function Demo() {
  return (
    <Stack gap="lg">
      <div>
        <Text variant="small" weight="semibold" style={{ marginBottom: 8 }}>
          API — 99,2% beschikbaar
        </Text>
        <Tracker data={DAGEN} startLabel="45 dagen geleden" endLabel="vandaag" label="Beschikbaarheid API" />
      </div>
      <Tracker
        size="sm"
        data={DAGEN.slice(20).map((dag) => ({ ...dag, tooltip: undefined }))}
        label="Beschikbaarheid website"
      />
    </Stack>
  );
}
