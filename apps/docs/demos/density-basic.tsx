"use client";
import { Badge, Button, Card, CardContent, DensityToggle, Icon, useTheme } from "@dafke/ui";

export default function Demo() {
  const { density } = useTheme();

  return (
    <Card>
      <CardContent style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <DensityToggle />
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            actief: <code>{density}</code>
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Button icon={<Icon name="check" />}>Opslaan</Button>
          <Button variant="secondary">Annuleren</Button>
          <Button size="sm" variant="ghost">Klein</Button>
          <Badge tone="accent">schaalt mee</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
