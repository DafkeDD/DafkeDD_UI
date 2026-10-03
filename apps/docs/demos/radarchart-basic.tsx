"use client";
import { RadarChart } from "@dafke/ui";

export default function Demo() {
  return (
    <RadarChart
      axes={["Snelheid", "Toegankelijkheid", "Documentatie", "Grootte", "Thema's", "Testdekking"]}
      series={[
        { name: "Dafke UI", data: [88, 92, 84, 95, 90, 72] },
        { name: "Gemiddelde", data: [70, 58, 66, 52, 61, 64] },
      ]}
      size={300}
    />
  );
}
