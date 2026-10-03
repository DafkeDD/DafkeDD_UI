"use client";
import { Card, CardContent, CopyButton, DataPill, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <Card style={{ maxWidth: 460 }}>
      <CardContent>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <DataPill icon={<Icon name="phone" />} label="Telefoon" value="+32 476 21 33 08" />
          <CopyButton value="+32 476 21 33 08" />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
          <code className="docs-inline-code" style={{ flex: 1 }}>BE 0123.456.789</code>
          <CopyButton size="sm" value="BE 0123.456.789" />
        </div>

        <div style={{ marginTop: 16 }}>
          <CopyButton variant="outline" value="npx dafke-ui add copy-button" label="Commando kopiëren" />
        </div>
      </CardContent>
    </Card>
  );
}
