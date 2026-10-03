"use client";
import { useState } from "react";
import { Avatar, Badge, Button, DataTable, Icon, type DataTableColumn } from "@dafke/ui";

interface Klant {
  id: string;
  naam: string;
  email: string;
  plan: "Start" | "Groei" | "Schaal";
  status: "actief" | "proef" | "gepauzeerd";
  omzet: number;
  sinds: string;
}

const KLANTEN: Klant[] = [
  { id: "1", naam: "De Vries Bouw", email: "info@devriesbouw.be", plan: "Schaal", status: "actief", omzet: 24800, sinds: "2023-04-12" },
  { id: "2", naam: "Praktijk Vermeulen", email: "onthaal@vermeulen.be", plan: "Groei", status: "actief", omzet: 9600, sinds: "2024-01-08" },
  { id: "3", naam: "Atelier Nord", email: "hallo@ateliernord.be", plan: "Start", status: "proef", omzet: 0, sinds: "2026-09-02" },
  { id: "4", naam: "Vanhove Transport", email: "planning@vanhove.be", plan: "Schaal", status: "actief", omzet: 41200, sinds: "2022-11-30" },
  { id: "5", naam: "Boekhandel Aurora", email: "info@aurora.be", plan: "Start", status: "gepauzeerd", omzet: 1450, sinds: "2025-03-21" },
  { id: "6", naam: "Kine Lievens", email: "afspraak@lievens.be", plan: "Groei", status: "actief", omzet: 7300, sinds: "2024-08-19" },
  { id: "7", naam: "Studio Kaap", email: "studio@kaap.be", plan: "Groei", status: "proef", omzet: 0, sinds: "2026-08-27" },
  { id: "8", naam: "Bakkerij Meert", email: "bestel@meert.be", plan: "Start", status: "actief", omzet: 3120, sinds: "2025-06-04" },
];

const TOON = { actief: "green", proef: "accent", gepauzeerd: "amber" } as const;

export default function Demo() {
  const [gekozen, setGekozen] = useState<string[]>([]);

  const kolommen: Array<DataTableColumn<Klant>> = [
    {
      key: "naam",
      header: "Klant",
      sortable: true,
      strong: true,
      cell: (rij) => (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={rij.naam} size={30} />
          <span style={{ display: "grid" }}>
            <span>{rij.naam}</span>
            <span style={{ fontSize: 12, color: "var(--text-3)" }}>{rij.email}</span>
          </span>
        </span>
      ),
    },
    { key: "plan", header: "Plan", sortable: true, hideBelow: 640 },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (rij) => <Badge tone={TOON[rij.status]}>{rij.status}</Badge>,
    },
    {
      key: "omzet",
      header: "Omzet",
      align: "right",
      sortable: true,
      cell: (rij) => rij.omzet.toLocaleString("nl-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
    },
    {
      key: "sinds",
      header: "Klant sinds",
      align: "right",
      sortable: true,
      hideBelow: 860,
      cell: (rij) => new Date(rij.sinds).toLocaleDateString("nl-BE"),
    },
  ];

  return (
    <DataTable
      data={KLANTEN}
      columns={kolommen}
      rowKey={(rij) => rij.id}
      searchable
      searchPlaceholder="Zoek op naam, e-mail of plan…"
      selectable
      selected={gekozen}
      onSelectedChange={setGekozen}
      selectionActions={
        <Button size="sm" variant="secondary">
          <Icon name="mail" size={15} />
          Mailen
        </Button>
      }
      defaultSort={{ key: "omzet", direction: "desc" }}
      pageSize={5}
      emptyTitle="Geen klanten gevonden"
      emptyDescription="Pas je zoekterm aan of maak een nieuwe klant aan."
    />
  );
}
