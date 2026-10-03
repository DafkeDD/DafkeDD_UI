"use client";
import { useState } from "react";
import {
  Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Icon, Kbd,
} from "@dafke/ui";

export default function Demo() {
  const [archief, setArchief] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" iconRight={<Icon name="chevronDown" />}>Acties</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent minWidth={230}>
        <DropdownMenuLabel>Tenant</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem icon={<Icon name="eye" />} shortcut={<Kbd>D</Kbd>}>
            Details bekijken
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="edit" />} shortcut={<Kbd>E</Kbd>}>
            Bewerken
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="copy" />}>Nummer kopiëren</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={archief} onCheckedChange={setArchief}>
          Toon gearchiveerd
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive icon={<Icon name="trash" />}>
          Verwijderen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
