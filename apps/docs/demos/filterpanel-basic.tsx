"use client";
import { useState } from "react";
import { Avatar, FilterGroup, FilterOption, FilterPanel } from "@dafke/ui";

const ARTSEN = [
  { id: "reyniers", naam: "Dr. Reyniers", aantal: 38 },
  { id: "landsheer", naam: "Dr. De Landsheer", aantal: 24 },
  { id: "miroir", naam: "Mr. Miroir", aantal: 12 },
  { id: "aznar", naam: "Dr. Aznar", aantal: 9 },
  { id: "claes", naam: "Dr. Claes", aantal: 4 },
];

export default function Demo() {
  const [status, setStatus] = useState<string[]>(["open"]);
  const [artsen, setArtsen] = useState<string[]>([]);

  const wissel = (lijst: string[], id: string) =>
    lijst.includes(id) ? lijst.filter((x) => x !== id) : [...lijst, id];

  const actief = status.length + artsen.length;

  return (
    <FilterPanel
      title="Filters"
      activeCount={actief}
      onClear={() => {
        setStatus([]);
        setArtsen([]);
      }}
    >
      <FilterGroup label="Status" collapsible>
        {[
          { id: "open", label: "Open", aantal: 12 },
          { id: "afgewerkt", label: "Afgewerkt", aantal: 38 },
          { id: "dringend", label: "Dringend", aantal: 2 },
        ].map((item) => (
          <FilterOption
            key={item.id}
            label={item.label}
            count={item.aantal}
            checked={status.includes(item.id)}
            onCheckedChange={() => setStatus((vorige) => wissel(vorige, item.id))}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Behandelaar" collapsible maxVisible={3}>
        {ARTSEN.map((arts) => (
          <FilterOption
            key={arts.id}
            label={arts.naam}
            count={arts.aantal}
            lead={<Avatar name={arts.naam.replace(/^(Dr\.|Mr\.)\s*/, "")} size={22} />}
            checked={artsen.includes(arts.id)}
            onCheckedChange={() => setArtsen((vorige) => wissel(vorige, arts.id))}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Periode">
        <FilterOption type="radio" name="periode" label="Deze week" defaultChecked />
        <FilterOption type="radio" name="periode" label="Deze maand" />
        <FilterOption type="radio" name="periode" label="Dit jaar" />
      </FilterGroup>
    </FilterPanel>
  );
}
