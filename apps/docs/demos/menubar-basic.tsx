"use client";
import { useState } from "react";
import {
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, Icon, Kbd,
  Menubar, MenubarContent, MenubarMenu, MenubarTrigger,
} from "@dafke/ui";

export default function Demo() {
  const [laatste, setLaatste] = useState<string>();

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <Menubar>
        <MenubarMenu value="dossier">
          <MenubarTrigger>Dossier</MenubarTrigger>
          <MenubarContent minWidth={210}>
            <DropdownMenuItem icon={<Icon name="plus" />} shortcut={<Kbd>N</Kbd>} onClick={() => setLaatste("Nieuw dossier")}>
              Nieuw dossier
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Icon name="folder" />} onClick={() => setLaatste("Openen")}>Openen…</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Icon name="print" />} onClick={() => setLaatste("Afdrukken")}>Afdrukken</DropdownMenuItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="bewerken">
          <MenubarTrigger>Bewerken</MenubarTrigger>
          <MenubarContent minWidth={200}>
            <DropdownMenuItem shortcut={<Kbd>Z</Kbd>} onClick={() => setLaatste("Ongedaan maken")}>Ongedaan maken</DropdownMenuItem>
            <DropdownMenuItem shortcut={<Kbd>C</Kbd>} onClick={() => setLaatste("Kopiëren")}>Kopiëren</DropdownMenuItem>
          </MenubarContent>
        </MenubarMenu>

        <MenubarMenu value="beeld">
          <MenubarTrigger>Beeld</MenubarTrigger>
          <MenubarContent minWidth={200}>
            <DropdownMenuLabel>Weergave</DropdownMenuLabel>
            <DropdownMenuItem icon={<Icon name="calendar" />} onClick={() => setLaatste("Agenda")}>Agenda</DropdownMenuItem>
            <DropdownMenuItem icon={<Icon name="menu" />} onClick={() => setLaatste("Lijst")}>Lijst</DropdownMenuItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
        {laatste ? `Gekozen: ${laatste}` : "Klik een menu open; daarna volgen de andere je muis."}
      </span>
    </div>
  );
}
