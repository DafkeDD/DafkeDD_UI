"use client";
import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Icon,
  type DataTableColumn,
} from "@dafke/ui";

interface Gebruiker {
  id: string;
  naam: string;
  email: string;
  rol: string;
  status: "actief" | "wachtend" | "offline";
}

const GEBRUIKERS: Gebruiker[] = [
  { id: "1", naam: "Ajay Sharma", email: "ajay@voorbeeld.be", rol: "UI-designer", status: "actief" },
  { id: "2", naam: "Rahul Kumar", email: "rahul@voorbeeld.be", rol: "Frontend", status: "wachtend" },
  { id: "3", naam: "Neha Verma", email: "neha@voorbeeld.be", rol: "UX-onderzoek", status: "offline" },
  { id: "4", naam: "Annelies Peeters", email: "annelies@voorbeeld.be", rol: "Productowner", status: "actief" },
  { id: "5", naam: "Tom Claes", email: "tom@voorbeeld.be", rol: "Backend", status: "actief" },
  { id: "6", naam: "Sarah Janssens", email: "sarah@voorbeeld.be", rol: "QA", status: "wachtend" },
  { id: "7", naam: "Mike De Smet", email: "mike@voorbeeld.be", rol: "DevOps", status: "offline" },
  { id: "8", naam: "Lotte Maes", email: "lotte@voorbeeld.be", rol: "Frontend", status: "actief" },
];

const TOON = { actief: "green", wachtend: "amber", offline: "neutral" } as const;

export default function Demo() {
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [rijen, setRijen] = useState(GEBRUIKERS);

  const kolommen: Array<DataTableColumn<Gebruiker>> = [
    {
      key: "naam",
      header: "Gebruiker",
      sortable: true,
      strong: true,
      cell: (rij) => (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={rij.naam} size={32} />
          <span style={{ display: "grid" }}>
            <span>{rij.naam}</span>
            <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-3)" }}>{rij.email}</span>
          </span>
        </span>
      ),
    },
    { key: "rol", header: "Rol", sortable: true, hideBelow: 640 },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (rij) => (
        <Badge tone={TOON[rij.status]} dot>
          {rij.status}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      data={rijen}
      columns={kolommen}
      rowKey={(rij) => rij.id}
      headerTone="accent"
      searchable
      searchPlaceholder="Zoek gebruikers…"
      selectable
      selected={gekozen}
      onSelectedChange={setGekozen}
      actions={
        <>
          <Button size="sm" variant="ghost" icon={<Icon name="filter" size={15} />}>
            Filter
          </Button>
          <Button size="sm" icon={<Icon name="plus" size={15} />}>
            Gebruiker
          </Button>
        </>
      }
      rowActions={(rij) => (
        <>
          <DropdownMenuItem icon={<Icon name="eye" size={15} />}>Bekijken</DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="edit" size={15} />}>Bewerken</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={<Icon name="trash" size={15} />}
            destructive
            onClick={() => setRijen((vorige) => vorige.filter((r) => r.id !== rij.id))}
          >
            Verwijderen
          </DropdownMenuItem>
        </>
      )}
      pageSize={5}
    />
  );
}
