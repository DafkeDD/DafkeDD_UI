"use client";
import { Badge, Card, CardContent, PulseDot } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      <Card>
        <CardContent>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
            <PulseDot label="Consultatie loopt" />
            Consultatie loopt
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 14 }}>
            <PulseDot tone="amber" />
            Wachtrij loopt uit
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 14 }}>
            <PulseDot tone="red" size={11} />
            Toestel offline
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 14 }}>
            <PulseDot tone="neutral" still />
            Niet actief (zonder animatie)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge tone="green">
              <PulseDot size={7} /> Live
            </Badge>
            <Badge tone="amber">
              <PulseDot tone="amber" size={7} /> Bezig
            </Badge>
          </div>
          <p style={{ fontSize: 13, marginTop: 12 }}>
            De halo gebruikt dezelfde kleur als het bolletje, via <code className="docs-inline-code">color-mix</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
