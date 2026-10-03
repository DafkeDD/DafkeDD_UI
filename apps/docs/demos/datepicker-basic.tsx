"use client";
import { useState } from "react";
import {
  DatePicker, DateRangePicker, type DateRange, Field, addDays, startOfWeek,
} from "@dafke/ui";

export default function Demo() {
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({});
  const today = new Date();

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 440 }}>
      <Field label="Startdatum" hint="Weekends zijn uitgeschakeld.">
        <DatePicker
          value={date}
          onValueChange={setDate}
          clearable
          disabled={(day) => day.getDay() === 0 || day.getDay() === 6}
          min={addDays(today, -30)}
        />
      </Field>

      <Field label="Verlofperiode">
        <DateRangePicker
          value={range}
          onValueChange={setRange}
          clearable
          presets={[
            { label: "Deze week", range: { from: startOfWeek(today), to: addDays(startOfWeek(today), 4) } },
            { label: "Volgende week", range: { from: addDays(startOfWeek(today), 7), to: addDays(startOfWeek(today), 11) } },
            { label: "Komende 14 dagen", range: { from: today, to: addDays(today, 13) } },
          ]}
        />
      </Field>

      <Field label="Klein formaat">
        <DatePicker size="sm" placeholder="dd maand jjjj" />
      </Field>
    </div>
  );
}
