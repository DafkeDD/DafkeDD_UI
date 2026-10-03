"use client";
import { useState } from "react";
import { Icon, SelectableGrid, Text, type SelectableItem } from "@dafke/ui";

const BEGIN: SelectableItem[] = [
  { id: "1", title: "Documenten", description: "12 items", icon: <Icon name="folder" size={18} />, tone: "blue" },
  { id: "2", title: "Foto's", description: "148 items", icon: <Icon name="image" size={18} />, tone: "green" },
  { id: "3", title: "Video's", description: "6 items", icon: <Icon name="play" size={18} />, tone: "red" },
  { id: "4", title: "Muziek", description: "39 items", icon: <Icon name="mic" size={18} />, tone: "violet" },
  { id: "5", title: "Bestanden", description: "212 items", icon: <Icon name="file" size={18} />, tone: "amber" },
  { id: "6", title: "Archief", description: "3 items", icon: <Icon name="box" size={18} />, tone: "neutral" },
];

export default function Demo() {
  const [items, setItems] = useState(BEGIN);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Text variant="small" tone="muted">
        Vink een paar kaarten aan: de balk verschijnt onderaan en verdwijnt weer
        zodra de selectie leeg is.
      </Text>
      <SelectableGrid
        items={items}
        showSelectAll
        actionTone="violet"
        onAction={(ids) => setItems((vorige) => vorige.filter((item) => !ids.includes(item.id)))}
        emptyTitle="Alles verwijderd"
        emptyDescription="Herlaad de pagina voor een nieuwe map."
      />
    </div>
  );
}
