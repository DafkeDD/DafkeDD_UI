"use client";
import { ContributionGraph } from "@dafke/ui";

/** Vaste pseudotoevallige reeks: dezelfde uitkomst op server en client. */
const EIND = new Date(2026, 8, 19);
const DATA = Array.from({ length: 365 }, (_, index) => {
  const datum = new Date(EIND.getTime() - index * 86400000);
  const ruis = (index * 2654435761) % 97;
  const weekend = datum.getDay() === 0 || datum.getDay() === 6;
  return {
    date: datum,
    value: weekend ? ruis % 3 : Math.max(0, (ruis % 13) - 2),
  };
});

export default function Demo() {
  return (
    <ContributionGraph
      data={DATA}
      until={EIND}
      weeks={40}
      formatTooltip={(dag) => `${dag.value} commits`}
    />
  );
}
