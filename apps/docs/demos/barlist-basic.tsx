"use client";
import { BarList, Stack, Text } from "@dafke/ui";

export default function Demo() {
  return (
    <Stack gap="xl" style={{ maxWidth: 460 }}>
      <div>
        <Text variant="eyebrow" style={{ marginBottom: 10 }}>
          Meest bekeken pagina&apos;s
        </Text>
        <BarList
          data={[
            { label: "/docs/componenten/button", value: 12840, href: "#" },
            { label: "/docs/installatie", value: 9210, href: "#" },
            { label: "/", value: 7415, href: "#" },
            { label: "/docs/theming", value: 4102, href: "#" },
            { label: "/docs/componenten/dialog", value: 2860, href: "#" },
          ]}
          formatValue={(waarde) => waarde.toLocaleString("nl-BE")}
        />
      </div>

      <div>
        <Text variant="eyebrow" style={{ marginBottom: 10 }}>
          Verkeer per bron
        </Text>
        <BarList
          multicolor
          size="sm"
          data={[
            { label: "Google", value: 61 },
            { label: "Direct", value: 24 },
            { label: "LinkedIn", value: 9 },
            { label: "Overig", value: 6 },
          ]}
          formatValue={(waarde) => `${waarde}%`}
        />
      </div>
    </Stack>
  );
}
