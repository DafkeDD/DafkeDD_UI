"use client";
import { useState } from "react";
import { LogoutButton, Row, Text } from "@dafke/ui";

export default function Demo() {
  const [teller, setTeller] = useState(0);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Row gap="xl" wrap align="center">
        <LogoutButton onLogout={() => setTeller((n) => n + 1)} />
        <LogoutButton variant="light" onLogout={() => setTeller((n) => n + 1)} />
        <LogoutButton size="lg" onLogout={() => setTeller((n) => n + 1)}>
          Afmelden
        </LogoutButton>
      </Row>
      <Text variant="small" tone="muted">
        Zweef erover: het mannetje zet een stapje. Klik: het wandelt de deur in
        en de deur gaat dicht. Uitgelogd: {teller}×
      </Text>
    </div>
  );
}
