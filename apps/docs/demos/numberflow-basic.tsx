"use client";
import { useState } from "react";
import { Button, Icon, Row, Stack, Text } from "@dafke/ui";
import { NumberFlow } from "@dafke/ui/motion";

export default function Demo() {
  const [omzet, setOmzet] = useState(128450);
  const [bezoekers, setBezoekers] = useState(2841);

  return (
    <Stack gap="xl">
      <Row gap="xl" wrap>
        <Stack gap="xs">
          <Text variant="eyebrow">Omzet deze maand</Text>
          <NumberFlow
            value={omzet}
            size="xl"
            format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }}
            colorize
          />
        </Stack>
        <Stack gap="xs">
          <Text variant="eyebrow">Bezoekers</Text>
          <NumberFlow value={bezoekers} size="xl" />
        </Stack>
      </Row>

      <Row gap="sm" wrap>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setOmzet((n) => n + 4820);
            setBezoekers((n) => n + 137);
          }}
        >
          <Icon name="arrowUp" size={15} />
          Groei
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setOmzet((n) => Math.max(0, n - 6310));
            setBezoekers((n) => Math.max(0, n - 219));
          }}
        >
          <Icon name="arrowDown" size={15} />
          Daling
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOmzet(Math.round(Math.random() * 400000))}>
          Willekeurig
        </Button>
      </Row>
    </Stack>
  );
}
