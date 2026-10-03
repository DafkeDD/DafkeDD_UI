"use client";
import { useEffect, useState } from "react";
import { Calendar, Card, CardContent, type DateRange, formatDate, formatDateRange } from "@dafke/ui";

export default function Demo() {
  // Vandaag pas in de browser kiezen: de pagina wordt vooraf gerenderd, en de
  // datum van de server hoeft niet die van de bezoeker te zijn.
  const [single, setSingle] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({});
  useEffect(() => setSingle(new Date()), []);

  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
      <Card>
        <CardContent>
          <Calendar
            selected={single}
            onSelect={setSingle}
            showWeekNumbers
            markers={(date) => date.getDay() === 3}
          />
          <p style={{ marginTop: 12, fontSize: 13 }}>
            Gekozen: <strong>{single ? formatDate(single) : "niets"}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={(date) => date.getDay() === 0}
          />
          <p style={{ marginTop: 12, fontSize: 13 }}>
            Periode: <strong>{range.from ? formatDateRange(range) : "niets"}</strong> — zondagen staan uit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
