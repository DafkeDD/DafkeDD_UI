"use client";
import { Button, Icon, Row } from "@dafke/ui";

// Met asChild wordt de knop jouw eigen element — hier een gewone <a>, maar
// next/link of een router-link werkt net zo. Iconen en spinner komen erin.
export default function Demo() {
  return (
    <Row gap="md" wrap>
      <Button asChild icon={<Icon name="file" />}>
        <a href="#documentatie">Documentatie</a>
      </Button>
      <Button asChild variant="secondary" iconRight={<Icon name="externalLink" />}>
        <a href="https://github.com/DafkeDD/DafkeDD_UI" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </Button>
      <Button asChild variant="ghost" icon={<Icon name="arrowLeft" />}>
        <a href="#terug">Terug</a>
      </Button>
    </Row>
  );
}
