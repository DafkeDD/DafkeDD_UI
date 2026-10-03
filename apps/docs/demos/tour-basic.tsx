"use client";
import { useState } from "react";
import { Badge, Button, Card, Icon, Input, Stack, Text, Tour } from "@dafke/ui";

export default function Demo() {
  const [open, setOpen] = useState(false);

  return (
    <Stack gap="md">
      <Card style={{ padding: 14, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Input
            id="tour-zoek"
            placeholder="Zoeken…"
            prefix={<Icon name="search" size={16} />}
            style={{ maxWidth: 220 }}
          />
          <Badge id="tour-status" tone="green" dot>
            Live
          </Badge>
          <Button id="tour-actie" size="sm" variant="secondary" style={{ marginInlineStart: "auto" }}>
            <Icon name="plus" size={15} />
            Nieuw
          </Button>
        </div>
        <Text variant="small" tone="muted">
          Dit balkje staat model voor je eigen scherm; de rondleiding licht er
          drie onderdelen van uit.
        </Text>
      </Card>

      <Button onClick={() => setOpen(true)} style={{ alignSelf: "flex-start" }}>
        Rondleiding starten
      </Button>

      <Tour
        open={open}
        onOpenChange={setOpen}
        steps={[
          {
            target: "#tour-zoek",
            title: "Zoeken",
            content: "Zoek meteen door alles wat in dit scherm staat. Sneltoets: Cmd of Ctrl + K.",
          },
          {
            target: "#tour-status",
            title: "Status",
            content: "Hier zie je in één oogopslag of de koppeling draait.",
          },
          {
            target: "#tour-actie",
            title: "Nieuw item",
            content: "En hiermee voeg je er eentje toe. Dat was het al.",
            side: "top",
          },
        ]}
      />
    </Stack>
  );
}
