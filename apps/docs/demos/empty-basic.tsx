"use client";
import { Button, Card, EmptyState, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
      <Card>
        <EmptyState
          icon={<Icon name="ticket" />}
          title="Nog geen tickets"
          description="Zodra een klant een melding maakt, verschijnt die hier."
          action={<Button icon={<Icon name="plus" />}>Ticket aanmaken</Button>}
        />
      </Card>
      <Card>
        <EmptyState
          size="sm"
          icon={<Icon name="search" />}
          title="Geen resultaten"
          description="Pas je zoekterm of filters aan."
          action={<Button size="sm" variant="secondary">Filters wissen</Button>}
        />
      </Card>
    </div>
  );
}
