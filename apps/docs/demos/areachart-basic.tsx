"use client";
import { AreaChart, Stack, Text } from "@dafke/ui";

const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep"];

export default function Demo() {
  return (
    <Stack gap="xl">
      <div>
        <Text variant="small" tone="muted" style={{ marginBottom: 8 }}>
          Twee reeksen over elkaar — beweeg over de grafiek voor de waarden.
        </Text>
        <AreaChart
          labels={MAANDEN}
          series={[
            { name: "Nieuwe klanten", data: [180, 210, 265, 240, 310, 352, 330, 398, 441] },
            { name: "Opgezegd", data: [42, 38, 55, 61, 48, 52, 70, 58, 49] },
          ]}
          formatValue={(waarde) => waarde.toLocaleString("nl-BE")}
        />
      </div>

      <div>
        <Text variant="small" tone="muted" style={{ marginBottom: 8 }}>
          Gestapeld: de reeksen tellen op tot het totaal.
        </Text>
        <AreaChart
          labels={MAANDEN}
          stacked
          height={200}
          series={[
            { name: "Web", data: [120, 140, 155, 170, 190, 210, 205, 240, 262] },
            { name: "Mobiel", data: [90, 105, 130, 142, 168, 180, 195, 210, 238] },
            { name: "API", data: [30, 34, 41, 48, 52, 61, 66, 72, 84] },
          ]}
        />
      </div>
    </Stack>
  );
}
