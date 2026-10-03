"use client";
import { useState } from "react";
import {
  ContextMenu, ContextMenuContent, ContextMenuTrigger, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, Icon, Kbd,
} from "@dafke/ui";

export default function Demo() {
  const [laatste, setLaatste] = useState<string>();

  return (
    <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            style={{
              display: "grid", placeItems: "center", width: 320, height: 130, padding: 16,
              border: "1px dashed var(--border-strong)", borderRadius: "var(--r-md)",
              background: "var(--surface-2)", color: "var(--text-3)", fontSize: 13, textAlign: "center",
            }}
          >
            Rechtermuisklik hier
            <br />
            (of lang drukken op touch)
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent minWidth={210}>
          <DropdownMenuLabel>Afspraak</DropdownMenuLabel>
          <DropdownMenuItem icon={<Icon name="eye" />} shortcut={<Kbd>D</Kbd>} onClick={() => setLaatste("Details")}>
            Details bekijken
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="edit" />} shortcut={<Kbd>E</Kbd>} onClick={() => setLaatste("Bewerken")}>
            Bewerken
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="copy" />} onClick={() => setLaatste("Dupliceren")}>
            Dupliceren
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive icon={<Icon name="trash" />} onClick={() => setLaatste("Verwijderen")}>
            Verwijderen
          </DropdownMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
        {laatste ? `Gekozen: ${laatste}` : "Nog niets gekozen"}
      </span>
    </div>
  );
}
