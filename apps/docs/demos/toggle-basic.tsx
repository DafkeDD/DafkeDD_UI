"use client";
import { useState } from "react";
import { ButtonGroup, Icon, Toggle, ToggleGroup, ToggleGroupItem } from "@dafke/ui";

export default function Demo() {
  const [vet, setVet] = useState(true);
  const [opmaak, setOpmaak] = useState<string[]>(["bold"]);
  const [weergave, setWeergave] = useState("lijst");

  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Toggle pressed={vet} onPressedChange={setVet} icon={<Icon name="star" />}>
          Favoriet
        </Toggle>
        <Toggle variant="outline" icon={<Icon name="bell" />} aria-label="Meldingen" />
        <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{vet ? "aan" : "uit"}</span>
      </div>

      <ToggleGroup type="multiple" value={opmaak} onValueChange={setOpmaak} joined>
        <ToggleGroupItem value="bold" aria-label="Vet"><b>B</b></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Cursief"><i>I</i></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Onderstreept"><u>U</u></ToggleGroupItem>
      </ToggleGroup>

      <ButtonGroup label="Weergave" joined>
        <ToggleGroup type="single" value={weergave} onValueChange={setWeergave} joined>
          <ToggleGroupItem value="lijst" icon={<Icon name="menu" />}>Lijst</ToggleGroupItem>
          <ToggleGroupItem value="raster" icon={<Icon name="grip" />}>Raster</ToggleGroupItem>
          <ToggleGroupItem value="agenda" icon={<Icon name="calendar" />}>Agenda</ToggleGroupItem>
        </ToggleGroup>
      </ButtonGroup>
      <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
        opmaak: {opmaak.join(", ") || "geen"} · weergave: {weergave}
      </span>
    </div>
  );
}
