"use client";
import { BarChart, Card, CardContent, CardHeader, CardTitle, LineChart } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
      <Card>
        <CardHeader>
          <CardTitle>Nieuwe tenants per maand</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            height={180}
            showValues
            data={[
              { label: "jan", value: 18 }, { label: "feb", value: 24 }, { label: "mrt", value: 21 },
              { label: "apr", value: 32 }, { label: "mei", value: 28 }, { label: "jun", value: 39 },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Omzet vs. kosten</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            area
            height={180}
            labels={["jan", "feb", "mrt", "apr", "mei", "jun"]}
            series={[
              { name: "Omzet", data: [28, 34, 31, 42, 46, 52] },
              { name: "Kosten", data: [18, 19, 22, 21, 24, 26] },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
