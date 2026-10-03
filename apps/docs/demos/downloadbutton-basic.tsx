"use client";
import { Row, Stack, Text } from "@dafke/ui";
import { DownloadButton } from "@dafke/ui/motion";

export default function Demo() {
  return (
    <Stack gap="xl">
      <Stack gap="sm">
        <Text variant="eyebrow">Balk in de knop</Text>
        <Row gap="md" wrap>
          <DownloadButton />
          <DownloadButton tone="violet" size="lg">
            Rapport ophalen
          </DownloadButton>
          <DownloadButton
            tone="green"
            onDownload={async (voortgang) => {
              for (let i = 1; i <= 10; i += 1) {
                await new Promise((klaar) => window.setTimeout(klaar, 120));
                voortgang(i / 10);
              }
            }}
          >
            Met eigen voortgang
          </DownloadButton>
        </Row>
      </Stack>

      <Stack gap="sm">
        <Text variant="eyebrow">Als ring</Text>
        <Row gap="xl" wrap align="start">
          <DownloadButton variant="ring" />
          <DownloadButton variant="ring" tone="violet" size="lg" demoDuration={3200} />
          <DownloadButton variant="ring" size="sm" showPercent={false} />
        </Row>
      </Stack>
    </Stack>
  );
}
