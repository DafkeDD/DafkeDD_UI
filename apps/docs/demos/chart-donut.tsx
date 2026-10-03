"use client";
import { Card, CardContent, CardHeader, CardTitle, DonutChart, Sparkline } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
      <Card>
        <CardHeader>
          <CardTitle>Verdeling per app</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart
            centerValue="1.842"
            centerLabel="licenties"
            data={[
              { label: "Facturatie", value: 720 },
              { label: "Vault", value: 512 },
              { label: "Tickets", value: 380 },
              { label: "Access", value: 230 },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sparklines</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: "grid", gap: 18 }}>
            <Sparkline data={[4, 8, 6, 12, 10, 16, 14, 22]} />
            <Sparkline data={[22, 18, 19, 12, 14, 9, 11, 6]} color="var(--red)" />
            <Sparkline data={[9, 11, 10, 13, 12, 15, 14, 17]} color="var(--violet)" filled={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
