"use client";
import { CategoryBar, Stack, Text } from "@dafke/ui";

export default function Demo() {
  return (
    <Stack gap="xl" style={{ maxWidth: 480 }}>
      <div>
        <Text variant="small" tone="muted" style={{ marginBottom: 10 }}>
          Budget verdeeld over teams, met het verbruik tot nu toe als wijzer.
        </Text>
        <CategoryBar
          showLabels
          showScale
          marker={62}
          markerLabel="verbruikt"
          data={[
            { value: 45, label: "Ontwikkeling" },
            { value: 30, label: "Marketing" },
            { value: 25, label: "Support" },
          ]}
          formatValue={(waarde) => `${waarde}%`}
        />
      </div>

      <div>
        <Text variant="small" tone="muted" style={{ marginBottom: 10 }}>
          Drempels van groen naar rood.
        </Text>
        <CategoryBar
          size="lg"
          marker={78}
          data={[
            { value: 60, color: "var(--green)" },
            { value: 25, color: "var(--amber)" },
            { value: 15, color: "var(--red)" },
          ]}
        />
      </div>
    </Stack>
  );
}
