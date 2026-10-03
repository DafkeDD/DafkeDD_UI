"use client";
import { Badge, Card, CardContent, Container, Grid, Row, Spacer, Stack, Text } from "@dafke/ui";

export default function Demo() {
  return (
    <Container size="md" padded={false}>
      <Stack gap="lg">
        <Row justify="between">
          <Text variant="h3">Stack, Row, Grid</Text>
          <Badge tone="accent">layout</Badge>
        </Row>

        <Row gap="sm">
          <Badge>Row</Badge>
          <Badge tone="blue">schikt zich</Badge>
          <Badge tone="violet">met wrap</Badge>
          <Spacer />
          <Badge tone="green">Spacer duwt dit naar rechts</Badge>
        </Row>

        <Grid min={180} gap="md">
          {["Kolommen", "die zich", "vanzelf", "schikken"].map((tekst) => (
            <Card key={tekst}>
              <CardContent>
                <Text weight="semibold">{tekst}</Text>
                <Text variant="small" tone="muted">min=180px</Text>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Stack gap="sm" divided>
          <Text variant="small">Een Stack met divided zet lijnen tussen de kinderen.</Text>
          <Text variant="small">Handig voor lijstjes zonder eigen component.</Text>
          <Text variant="small">Alles loopt op één afstandsschaal: xs tot xl.</Text>
        </Stack>
      </Stack>
    </Container>
  );
}
