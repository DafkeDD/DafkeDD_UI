"use client";
import { Badge, Button, FoldCard, Row, Text } from "@dafke/ui";

export default function Demo() {
  return (
    <Row gap="xl" wrap align="start">
      <FoldCard
        label="Ontdek meer"
        coverStyle={{
          background: "linear-gradient(150deg, #0f172a 0%, #1e293b 55%, #0f766e 100%)",
          color: "#fff",
        }}
        cover={
          <>
            <Text variant="eyebrow" style={{ color: "rgba(255,255,255,.62)" }}>
              Nieuw perspectief
            </Text>
            <Text variant="h2" style={{ color: "#fff", margin: 0 }}>
              Ontdek
              <br />
              meer
            </Text>
            <Text variant="small" style={{ color: "rgba(255,255,255,.75)" }}>
              Beweeg erover om open te vouwen
            </Text>
          </>
        }
      >
        <span>
          <Badge tone="accent" size="sm">
            Binnenkant
          </Badge>
        </span>
        <Text variant="h3" style={{ margin: 0 }}>
          Verrassing
        </Text>
        <Text variant="small" tone="muted">
          Een klep die opendraait geeft je twee schermen op één plek: de
          aandachtstrekker en het echte verhaal eronder.
        </Text>
        <Button size="sm" style={{ alignSelf: "flex-start" }}>
          Bekijk het
        </Button>
      </FoldCard>

      <FoldCard
        trigger="click"
        side="top"
        label="Openklappen"
        coverStyle={{
          background: "linear-gradient(200deg, #4338ca 0%, #7c3aed 100%)",
          color: "#fff",
        }}
        cover={
          <>
            <Text variant="eyebrow" style={{ color: "rgba(255,255,255,.62)" }}>
              Klik om te openen
            </Text>
            <Text variant="h3" style={{ color: "#fff", margin: 0 }}>
              Van bovenaf
            </Text>
          </>
        }
      >
        <Text variant="h3" style={{ margin: 0 }}>
          Ook per klik
        </Text>
        <Text variant="small" tone="muted">
          Met trigger=&quot;click&quot; blijft de kaart open tot je er weer op
          klikt — handiger op een touchscreen.
        </Text>
      </FoldCard>
    </Row>
  );
}
