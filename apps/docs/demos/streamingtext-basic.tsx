"use client";
import { useState } from "react";
import { Button, Card, Icon, Stack, StreamingText, Text, Thinking } from "@dafke/ui";

const ANTWOORD =
  "De offerte loopt af op 30 september. Twee posten wijken af van de vorige versie: het uurtarief ging van 78 naar 84 euro, en de post 'nazorg' is nieuw. Wil je dat ik er een korte mail van maak voor de klant?";

const REDENERING =
  "Eerst de twee versies naast elkaar gelegd.\nRegel 4 verschilt: uurtarief 78 → 84.\nRegel 9 is nieuw: nazorg, 3 uur.\nDe rest is identiek, dus die laat ik weg.";

export default function Demo() {
  const [ronde, setRonde] = useState(0);
  const [denkt, setDenkt] = useState(false);

  return (
    <Stack gap="md" style={{ maxWidth: 560 }}>
      <Stack gap="sm">
        <Thinking active={denkt} seconds={denkt ? undefined : 4} defaultOpen={false}>
          {REDENERING}
        </Thinking>

        <Card style={{ padding: 14 }}>
          <StreamingText
            key={ronde}
            text={ANTWOORD}
            speed={120}
            as="p"
            onDone={() => setDenkt(false)}
            style={{ margin: 0 }}
          />
        </Card>
      </Stack>

      <Button
        size="sm"
        variant="secondary"
        style={{ alignSelf: "flex-start" }}
        onClick={() => {
          setDenkt(true);
          setRonde((n) => n + 1);
        }}
      >
        <Icon name="refresh" size={15} />
        Opnieuw
      </Button>

      <Text variant="small" tone="muted">
        Het kopje van het redeneerblok glinstert zolang er gedacht wordt, en
        toont daarna hoe lang het duurde.
      </Text>
    </Stack>
  );
}
