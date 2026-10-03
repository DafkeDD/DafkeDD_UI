"use client";
import { useState } from "react";
import { Chip, ChipGroup, Icon } from "@dafke/ui";

const ARTSEN = ["Alle artsen", "Dr. Reyniers", "Dr. De Landsheer", "Mr. Miroir"];

export default function Demo() {
  const [filter, setFilter] = useState("Alle artsen");
  const [tags, setTags] = useState(["Diabetes", "Retinopathie", "Controle"]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <ChipGroup>
        {ARTSEN.map((naam) => (
          <Chip key={naam} selected={filter === naam} onClick={() => setFilter(naam)}>
            {naam}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup>
        <Chip icon={<Icon name="clock" />} count={12}>Open</Chip>
        <Chip icon={<Icon name="checkCircle" />} count={38} selected>Afgewerkt</Chip>
        <Chip icon={<Icon name="alert" />} count={2}>Dringend</Chip>
        <Chip disabled>Gearchiveerd</Chip>
      </ChipGroup>

      <ChipGroup>
        {tags.map((tag) => (
          <Chip key={tag} size="sm" onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}>
            {tag}
          </Chip>
        ))}
        {tags.length === 0 && <span style={{ fontSize: 13, color: "var(--text-3)" }}>Alle labels verwijderd.</span>}
      </ChipGroup>
    </div>
  );
}
