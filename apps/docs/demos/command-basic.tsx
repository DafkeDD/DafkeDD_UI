"use client";
import { useState } from "react";
import {
  Button, Command, CommandDialog, CommandEmpty, CommandFooter, CommandGroup, CommandInput, CommandItem,
  CommandList, Icon, Kbd,
} from "@dafke/ui";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [laatste, setLaatste] = useState<string | null>(null);

  const items = (
    <>
      <CommandInput placeholder="Zoek een pagina of actie…" />
      <CommandList>
        <CommandEmpty>Niets gevonden.</CommandEmpty>
        <CommandGroup heading="Navigatie">
          <CommandItem icon={<Icon name="dashboard" />} onSelect={() => setLaatste("Dashboard")}>Dashboard</CommandItem>
          <CommandItem icon={<Icon name="building" />} onSelect={() => setLaatste("Tenants")}>Tenants</CommandItem>
          <CommandItem icon={<Icon name="euro" />} onSelect={() => setLaatste("Facturen")}>Facturen</CommandItem>
          <CommandItem icon={<Icon name="ticket" />} onSelect={() => setLaatste("Tickets")}>Tickets</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Acties">
          <CommandItem icon={<Icon name="plus" />} shortcut={<Kbd keys={["⌘", "N"]} />} onSelect={() => setLaatste("Nieuwe tenant")}>
            Nieuwe tenant
          </CommandItem>
          <CommandItem icon={<Icon name="users" />} onSelect={() => setLaatste("Gebruiker uitnodigen")}>
            Gebruiker uitnodigen
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <CommandFooter>
        <span>↑↓ navigeren</span>
        <span>↵ kiezen</span>
        <span>esc sluiten</span>
      </CommandFooter>
    </>
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Button variant="secondary" icon={<Icon name="search" />} onClick={() => setOpen(true)}>
          Palet openen
        </Button>
        <span style={{ fontSize: 13, color: "var(--text-3)" }}>
          of druk <Kbd keys={["⌘", "K"]} /> {laatste && `· laatst gekozen: ${laatste}`}
        </span>
      </div>

      <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-lg)", background: "var(--surface)", overflow: "hidden" }}>
        <Command>{items}</Command>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        {items}
      </CommandDialog>
    </div>
  );
}
