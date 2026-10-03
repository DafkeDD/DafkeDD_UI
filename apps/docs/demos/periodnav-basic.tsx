"use client";
import { useState } from "react";
import { PeriodNav, addDays, endOfWeek, formatDateRange, getISOWeek, startOfWeek } from "@dafke/ui";

export default function Demo() {
  const [anchor, setAnchor] = useState(new Date());
  const from = startOfWeek(anchor);
  const to = endOfWeek(anchor);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PeriodNav
        label={`Week ${getISOWeek(anchor)} · ${formatDateRange({ from, to })}`}
        onPrevious={() => setAnchor(addDays(anchor, -7))}
        onNext={() => setAnchor(addDays(anchor, 7))}
        onToday={() => setAnchor(new Date())}
      />
      <PeriodNav variant="plain" size="sm" label="Maart 2026" onPrevious={() => undefined} onNext={() => undefined} />
    </div>
  );
}
