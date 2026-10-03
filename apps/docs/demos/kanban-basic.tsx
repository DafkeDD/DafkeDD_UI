"use client";
import { useState } from "react";
import { Avatar, Badge, Button, Icon, Kanban, Text, type KanbanCard } from "@dafke/ui";

const BEGIN: Record<string, KanbanCard[]> = {
  todo: [
    { id: "1", title: "Facturatie koppelen", description: "Exact Online, enkel lezen", tone: "blue", footer: <Badge tone="neutral" size="sm">backend</Badge> },
    { id: "2", title: "Foutpagina 500", description: "Nu nog de standaard van Next", tone: "red" },
    { id: "3", title: "Wachtwoord vergeten", tone: "accent" },
  ],
  bezig: [
    {
      id: "4",
      title: "Planningsscherm",
      description: "Week- en dagweergave",
      tone: "violet",
      footer: (
        <>
          <Avatar name="Davey" size={22} />
          <Badge tone="violet" size="sm">design</Badge>
        </>
      ),
    },
  ],
  review: [{ id: "5", title: "Exporteren naar CSV", description: "Wacht op nazicht", tone: "amber" }],
  klaar: [
    { id: "6", title: "Donkere modus", tone: "green" },
    { id: "7", title: "Zoeken in de sidebar", tone: "green" },
  ],
};

export default function Demo() {
  const [bord, setBord] = useState(BEGIN);

  return (
    <div>
      <Text variant="small" tone="muted" style={{ marginBottom: 10 }}>
        Sleep een kaart naar een andere kolom, of geef hem focus en gebruik de
        pijltjes links en rechts.
      </Text>
      <Kanban
        columns={[
          { id: "todo", title: "Te doen" },
          { id: "bezig", title: "Bezig", limit: 2 },
          { id: "review", title: "Nazicht" },
          { id: "klaar", title: "Klaar" },
        ]}
        cards={bord}
        onCardsChange={setBord}
        columnFooter={(kolom) =>
          kolom.id === "todo" ? (
            <Button size="sm" variant="ghost" style={{ width: "100%" }}>
              <Icon name="plus" size={15} />
              Kaart
            </Button>
          ) : null
        }
      />
    </div>
  );
}
