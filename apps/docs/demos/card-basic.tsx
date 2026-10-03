"use client";
import {
  Badge, Button, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Facturatie</CardTitle>
            <CardDescription>Maandelijkse afrekening per tenant</CardDescription>
          </div>
          <CardAction>
            <Badge tone="green">Actief</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          Alle openstaande facturen worden op de eerste werkdag van de maand automatisch verstuurd.
        </CardContent>
        <CardFooter>
          <Button size="sm">Bekijken</Button>
          <Button size="sm" variant="ghost">Instellingen</Button>
        </CardFooter>
      </Card>

      <Card interactive>
        <CardHeader>
          <div>
            <CardTitle>Klikbare kaart</CardTitle>
            <CardDescription>Hover voor het effect</CardDescription>
          </div>
        </CardHeader>
        <CardContent>Gebruik `interactive` voor kaarten die als knop of link werken.</CardContent>
      </Card>
    </div>
  );
}
