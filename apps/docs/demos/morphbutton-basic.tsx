"use client";
import { Row, Stack, Text } from "@dafke/ui";
import { MorphButton } from "@dafke/ui/motion";

const wacht = (ms: number) => new Promise<void>((klaar) => window.setTimeout(klaar, ms));

export default function Demo() {
  return (
    <Stack gap="lg">
      <Row gap="lg" wrap align="center">
        <MorphButton onAction={() => wacht(900)}>Inloggen</MorphButton>
        <MorphButton tone="violet" size="lg" doneLabel="Bewaard" onAction={() => wacht(1100)}>
          Opslaan
        </MorphButton>
        <MorphButton
          tone="accent"
          errorLabel="Mislukt"
          onAction={async () => {
            await wacht(900);
            return false;
          }}
        >
          Dit gaat fout
        </MorphButton>
      </Row>

      <Text variant="small" tone="muted">
        De knop trekt samen tot een cirkel, draait, en klapt weer open als
        vinkje. Eén beweging in plaats van een knop die ineens een spinner wordt.
      </Text>
    </Stack>
  );
}
