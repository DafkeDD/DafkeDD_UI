"use client";
import { useState } from "react";
import { Alert, AvatarUpload, Card, CardContent, Field, Input, SwatchPicker } from "@dafke/ui";

const KLEUREN = [
  "var(--accent)",
  "var(--violet)",
  "var(--green)",
  "var(--amber)",
  "var(--red)",
  "var(--blue)",
];

export default function Demo() {
  const [foto, setFoto] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [kleur, setKleur] = useState(KLEUREN[0]);

  return (
    <Card>
      <CardContent style={{ display: "grid", gap: 18, maxWidth: 420 }}>
        <AvatarUpload
          value={foto}
          name="Annelies Peeters"
          size={72}
          onChange={(url) => {
            setFoto(url);
            setFout(null);
          }}
          onError={setFout}
        />

        {fout && <Alert tone="red">{fout}</Alert>}

        <Field label="Naam">
          <Input defaultValue="Annelies Peeters" />
        </Field>

        <Field label="Kleur van het profiel" hint="Wordt gebruikt in de agenda en op labels.">
          <SwatchPicker colors={KLEUREN} value={kleur} onValueChange={setKleur} allowCustom />
        </Field>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: "var(--r-md)",
            background: "var(--surface-3)",
            fontSize: 13,
            color: "var(--text-2)",
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: 999, background: kleur }} />
          Zo ziet je kleur eruit in een lijst.
        </div>
      </CardContent>
    </Card>
  );
}
