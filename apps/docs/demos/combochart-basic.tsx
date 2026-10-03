"use client";
import { ComboChart } from "@dafke/ui";

export default function Demo() {
  return (
    <ComboChart
      labels={["jan", "feb", "mrt", "apr", "mei", "jun"]}
      bars={[
        { name: "Omzet", data: [128000, 142000, 119000, 168000, 181000, 204000] },
        { name: "Kosten", data: [86000, 91000, 88000, 102000, 108000, 119000] },
      ]}
      lines={[{ name: "Marge", data: [32.8, 35.9, 26.1, 39.3, 40.3, 41.7], color: "var(--chart-4)" }]}
      formatBarValue={(waarde) => `€ ${(waarde / 1000).toFixed(0)}k`}
      formatLineValue={(waarde) => `${waarde.toFixed(1)}%`}
      height={260}
    />
  );
}
