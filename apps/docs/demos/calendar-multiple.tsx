"use client";
import { useState } from "react";
import { Badge, Calendar, Card, CardContent, formatDate } from "@dafke/ui";

export default function Demo() {
  const [dates, setDates] = useState<Date[]>([]);

  return (
    <Card style={{ maxWidth: 340 }}>
      <CardContent>
        <Calendar mode="multiple" size="sm" selected={dates} onSelect={setDates} hideOutsideDays />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {dates.length === 0 && <span style={{ fontSize: 13, color: "var(--text-3)" }}>Kies één of meer dagen.</span>}
          {dates
            .slice()
            .sort((a, b) => a.getTime() - b.getTime())
            .map((date) => (
              <Badge key={date.toISOString()} tone="accent">
                {formatDate(date, { day: "2-digit", month: "short" })}
              </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
