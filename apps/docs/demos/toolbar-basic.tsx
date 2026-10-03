"use client";
import { useState } from "react";
import {
  Icon, Textarea, Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator, ToolbarSpacer,
} from "@dafke/ui";

export default function Demo() {
  const [opmaak, setOpmaak] = useState<string[]>(["bold"]);
  const toggle = (key: string) =>
    setOpmaak((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 560 }}>
      <div>
        <Toolbar>
          <ToolbarGroup>
            <ToolbarButton active={opmaak.includes("bold")} onClick={() => toggle("bold")} label="Vet">
              <b>B</b>
            </ToolbarButton>
            <ToolbarButton active={opmaak.includes("italic")} onClick={() => toggle("italic")} label="Cursief">
              <i>I</i>
            </ToolbarButton>
            <ToolbarButton active={opmaak.includes("underline")} onClick={() => toggle("underline")} label="Onderstrepen">
              <u>U</u>
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarSeparator />
          <ToolbarGroup>
            <ToolbarButton label="Lijst"><Icon name="menu" /></ToolbarButton>
            <ToolbarButton label="Link"><Icon name="link" /></ToolbarButton>
            <ToolbarButton label="Afbeelding"><Icon name="image" /></ToolbarButton>
          </ToolbarGroup>
          <ToolbarSpacer />
          <ToolbarButton label="Ongedaan maken"><Icon name="refresh" /></ToolbarButton>
        </Toolbar>
        <Textarea
          rows={4}
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -1 }}
          defaultValue="Verslag van de consultatie…"
          aria-label="Inhoud"
        />
      </div>

      <Toolbar size="sm">
        <ToolbarButton active label="Dag">Dag</ToolbarButton>
        <ToolbarButton label="Week">Week</ToolbarButton>
        <ToolbarButton label="Maand">Maand</ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton label="Exporteren"><Icon name="download" /></ToolbarButton>
        <ToolbarButton label="Afdrukken"><Icon name="print" /></ToolbarButton>
      </Toolbar>
    </div>
  );
}
