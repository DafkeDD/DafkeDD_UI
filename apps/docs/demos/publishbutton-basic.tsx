"use client";
import { Row, Stack, Text } from "@dafke/ui";
import { PublishButton } from "@dafke/ui/motion";

export default function Demo() {
  return (
    <Stack gap="lg" style={{ width: "100%" }}>
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden",
          borderRadius: "var(--r-xl)", border: "1px solid var(--border)", minHeight: 150,
        }}
      >
        <div style={{ display: "grid", placeItems: "center", background: "var(--surface-2)", padding: 24 }}>
          <PublishButton />
        </div>
        <div style={{ display: "grid", placeItems: "center", background: "#0b0d12", padding: 24 }}>
          <PublishButton variant="light" />
        </div>
      </div>

      <Row gap="lg" wrap align="center">
        <PublishButton
          size="lg"
          texts={{ idle: "Naar productie", busy: "Uitrollen…", done: "Live" }}
          duration={2200}
        />
        <PublishButton size="sm" texts={{ idle: "Delen", busy: "Uploaden…", done: "Gedeeld" }} />
      </Row>
      <Text variant="small" tone="muted">
        Tijdens het publiceren staat de pijl stil en glijden wolkjes voorbij, alsof je opstijgt. De knop groeit en
        krimpt mee met het label, dat per stap omhoog oprolt.
      </Text>
    </Stack>
  );
}
