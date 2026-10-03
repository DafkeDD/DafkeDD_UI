"use client";
import { Button, Icon, SkipLink, Stack, Text, VisuallyHidden } from "@dafke/ui";

export default function Demo() {
  return (
    <Stack gap="md" style={{ maxWidth: 460 }}>
      <Text variant="small" tone="muted">
        Klik hieronder en druk op Tab: de sprongkoppeling verschijnt alleen met
        het toetsenbord.
      </Text>

      <div style={{ position: "relative", padding: 12, border: "1px dashed var(--border)", borderRadius: 8 }}>
        <SkipLink targetId="demo-inhoud">Naar de inhoud</SkipLink>
        <Button variant="ghost">Eerste knop in de balk</Button>
      </div>

      <div id="demo-inhoud" tabIndex={-1}>
        <Button variant="secondary">
          <Icon name="trash" size={16} />
          <VisuallyHidden>Bestand verwijderen</VisuallyHidden>
        </Button>
        <Text variant="small" tone="muted" style={{ marginTop: 8 }}>
          De knop hierboven toont enkel een icoon, maar leest voor als
          &ldquo;Bestand verwijderen&rdquo;.
        </Text>
      </div>
    </Stack>
  );
}
