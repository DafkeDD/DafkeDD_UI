"use client";
import { Badge, Button, Card, CardContent, Icon, Segmented, ThemeToggle, useTheme } from "@dafke/ui";

export default function Demo() {
  const { theme, resolved, setTheme } = useTheme();

  return (
    <Card>
      <CardContent>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <ThemeToggle />
          <Segmented
            value={theme}
            onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
            options={[
              { value: "light", label: "Licht", icon: <Icon name="sun" /> },
              { value: "dark", label: "Donker", icon: <Icon name="moon" /> },
              { value: "system", label: "Systeem", icon: <Icon name="monitor" /> },
            ]}
          />
          <Badge tone="accent">actief: {resolved}</Badge>
        </div>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Alle componenten schakelen mee omdat ze uitsluitend tokens gebruiken — geen enkele kleur staat hardcoded in een component.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Button>Primair</Button>
          <Button variant="secondary">Secundair</Button>
          <Badge tone="green">Betaald</Badge>
          <Badge tone="red">Vervallen</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
