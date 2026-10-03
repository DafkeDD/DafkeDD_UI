"use client";
import { useRef, useState } from "react";
import { Button, Icon, Row, Segmented, Stack, Text } from "@dafke/ui";
import { NotificationStack, type StackNotification } from "@dafke/ui/motion";

// Wat er bij elke klik op "Afleveren" binnenkomt, in deze volgorde.
const WACHTRIJ: Omit<StackNotification, "id">[] = [
  { title: "Berichten", description: "Annelies: staat de demo nog?", icon: <Icon name="mail" size={15} />, tone: "green", time: "nu" },
  { title: "Foto's", description: "Nieuwe herinnering · Gent", icon: <Icon name="image" size={15} />, tone: "amber", time: "9:31" },
  { title: "Agenda", description: "Designreview · over 15 min", icon: <Icon name="calendar" size={15} />, tone: "red", time: "9:26" },
  { title: "Mail", description: "Weekoverzicht · 12 verhalen", icon: <Icon name="mail" size={15} />, tone: "blue", time: "8:04" },
  { title: "Herinneringen", description: "Tutorial afwerken · 18:00", icon: <Icon name="bell" size={15} />, tone: "violet", time: "nu" },
  { title: "Weer", description: "Regen vanaf 17:00 · 12°", icon: <Icon name="cloud" size={15} />, tone: "accent", time: "nu" },
];

const START: StackNotification[] = WACHTRIJ.slice(0, 3).reverse().map((n, i) => ({ ...n, id: `start-${i}` }));

export default function Demo() {
  const [items, setItems] = useState<StackNotification[]>(START);
  const [weergave, setWeergave] = useState("stapel");
  const volgende = useRef(3);

  const aflever = () => {
    const bron = WACHTRIJ[volgende.current % WACHTRIJ.length];
    volgende.current += 1;
    setItems((vorige) => [{ ...bron, id: `n-${volgende.current}` }, ...vorige].slice(0, 6));
  };

  return (
    <Stack gap="md" style={{ width: "100%", maxWidth: 460 }}>
      <div
        style={{
          display: "grid", placeItems: "center", minHeight: 300, padding: "34px 20px",
          borderRadius: "var(--r-xl)",
          background:
            "radial-gradient(120% 90% at 20% 0%, #2b2a5c 0%, transparent 60%), radial-gradient(90% 80% at 100% 100%, #5b2446 0%, transparent 60%), #14152b",
        }}
      >
        <NotificationStack
          variant="glass"
          items={items}
          expanded={weergave === "lijst"}
          summary
          dots={false}
          showCount={false}
          onDismiss={(item) => setItems((vorige) => vorige.filter((n) => n.id !== item.id))}
          style={{ maxWidth: 300 }}
        />
      </div>

      <Row gap="sm" justify="center" wrap>
        <Segmented
          size="sm"
          value={weergave}
          onValueChange={setWeergave}
          options={[
            { value: "stapel", label: "Stapel" },
            { value: "lijst", label: "Lijst" },
          ]}
        />
        <Button size="sm" onClick={aflever}>
          <Icon name="bell" size={14} />
          Afleveren
        </Button>
      </Row>

      <Text variant="small" tone="muted" style={{ textAlign: "center" }}>
        Nieuwe meldingen schuiven van links binnen. In de lijst trek je een rij naar links om hem te wissen.
      </Text>
    </Stack>
  );
}
