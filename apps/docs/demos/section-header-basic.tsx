"use client";
import { Badge, Button, Card, CardContent, Icon, SectionHeader } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
      <Card>
        <CardContent>
          <SectionHeader title="Stappen" count="3/5" />
          <p style={{ fontSize: 13.5 }}>Standaard: gekleurd staafje, titel en een teller.</p>

          <SectionHeader
            tone="amber"
            title="Vorige bezoek"
            actions={<Button size="sm" variant="ghost" icon={<Icon name="externalLink" />} aria-label="Openen" />}
            style={{ marginTop: 26 }}
          />
          <p style={{ fontSize: 13.5 }}>Met een actie rechts.</p>

          <SectionHeader tone="red" title="Waarschuwingen" count={2} style={{ marginTop: 26 }} />
          <p style={{ fontSize: 13.5 }}>Toon rood voor wat aandacht vraagt.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeader
            tone="green"
            title="Live metingen"
            icon={<Icon name="chart" />}
            actions={<Badge tone="green" dot>verbonden</Badge>}
            divider
          />
          <SectionHeader size="sm" tone="neutral" title="Snelle acties" style={{ marginTop: 22 }} />
          <p style={{ fontSize: 13.5 }}>Het kleine formaat schrijft de titel in kapitalen — handig in een smalle rail.</p>
        </CardContent>
      </Card>
    </div>
  );
}
