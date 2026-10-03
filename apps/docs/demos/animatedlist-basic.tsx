"use client";
import { useState } from "react";
import { Avatar, Badge, Button, Icon, Row, Text } from "@dafke/ui";
import { AnimatedList, AnimatedListItem } from "@dafke/ui/motion";

const BRONNEN = [
  { naam: "Annelies Peeters", tekst: "heeft de offerte goedgekeurd", tone: "green" as const },
  { naam: "Systeem", tekst: "back-up voltooid", tone: "neutral" as const },
  { naam: "Tom Claes", tekst: "vraagt om nazicht", tone: "amber" as const },
  { naam: "Kine Lievens", tekst: "nieuwe afspraak op dinsdag", tone: "accent" as const },
];

export default function Demo() {
  const [items, setItems] = useState(() =>
    BRONNEN.slice(0, 3).map((bron, index) => ({ ...bron, id: index }))
  );
  const [teller, setTeller] = useState(3);

  const voegToe = () => {
    const bron = BRONNEN[teller % BRONNEN.length];
    setItems((vorige) => [{ ...bron, id: teller }, ...vorige].slice(0, 5));
    setTeller((n) => n + 1);
  };

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 440 }}>
      <Row gap="sm">
        <Button size="sm" onClick={voegToe}>
          <Icon name="plus" size={15} />
          Melding
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setItems((v) => v.slice(1))} disabled={items.length === 0}>
          Bovenste weg
        </Button>
      </Row>

      <AnimatedList max={5}>
        {items.map((item) => (
          <AnimatedListItem key={item.id}>
            <Avatar name={item.naam} size={30} />
            <div style={{ display: "grid", minWidth: 0 }}>
              <Text variant="small" weight="semibold">
                {item.naam}
              </Text>
              <Text variant="small" tone="muted">
                {item.tekst}
              </Text>
            </div>
            <Badge tone={item.tone} size="sm" style={{ marginInlineStart: "auto" }}>
              nieuw
            </Badge>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  );
}
