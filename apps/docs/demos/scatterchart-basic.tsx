"use client";
import { ScatterChart } from "@dafke/ui";

export default function Demo() {
  return (
    <ScatterChart
      xLabel="Bezoeken per week"
      yLabel="Conversie (%)"
      series={[
        {
          name: "Organisch",
          points: [
            { x: 420, y: 2.1, size: 18, label: "Blog" },
            { x: 1180, y: 3.4, size: 42, label: "Startpagina" },
            { x: 760, y: 2.8, size: 26, label: "Prijzen" },
            { x: 2040, y: 4.6, size: 88, label: "Documentatie" },
          ],
        },
        {
          name: "Betaald",
          points: [
            { x: 310, y: 5.2, size: 24, label: "Zoekadvertenties" },
            { x: 890, y: 3.9, size: 51, label: "Display" },
            { x: 1540, y: 6.1, size: 64, label: "Retargeting" },
          ],
        },
      ]}
      formatX={(waarde) => waarde.toLocaleString("nl-BE")}
      formatY={(waarde) => `${waarde}%`}
    />
  );
}
