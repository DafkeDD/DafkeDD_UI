"use client";
import { useState } from "react";
import { Alert, Button, Card, CardContent, ConfettiBurst, Textarea, VoiceButton } from "@dafke/ui";

export default function Demo() {
  const [tekst, setTekst] = useState("");
  const [tussentijds, setTussentijds] = useState("");
  const [melding, setMelding] = useState<string | null>(null);
  const [feest, setFeest] = useState(false);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <VoiceButton
              whenUnsupported="disable"
              lang="nl-BE"
              onInterim={setTussentijds}
              onFinal={(gezegd) => {
                setTekst((vorige) => (vorige ? `${vorige} ${gezegd}` : gezegd));
                setTussentijds("");
                setMelding(null);
              }}
              onNotice={(bericht) => {
                setTussentijds("");
                setMelding(bericht);
              }}
            />
            <span style={{ fontSize: 14, color: "var(--text-2)" }}>
              {tussentijds || "Klik op de microfoon en spreek een zin in."}
            </span>
          </div>

          <Textarea
            rows={3}
            value={tekst}
            onChange={(event) => setTekst(event.target.value)}
            placeholder="Hier komt de ingesproken tekst…"
          />

          {melding && <Alert tone="amber">{melding}</Alert>}
        </CardContent>
      </Card>

      <Card>
        <CardContent style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <Button onClick={() => setFeest(true)}>Vier iets</Button>
            {feest && <ConfettiBurst count={22} spread={70} onDone={() => setFeest(false)} />}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            ConfettiBurst respecteert “verminderde beweging”: dan gebeurt er niets.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
