"use client";
import { useState } from "react";
import { Field, Input, QrCode, Segmented } from "@dafke/ui";

export default function Demo() {
  const [waarde, setWaarde] = useState("https://dafke.ui/docs/componenten/qr-code");
  const [niveau, setNiveau] = useState("M");

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "start" }}>
      <div style={{ display: "grid", gap: 12 }}>
        <Field label="Inhoud van de code" hint="Elke tekst of URL; de code past zich meteen aan.">
          <Input value={waarde} onChange={(event) => setWaarde(event.target.value)} />
        </Field>
        <Field label="Foutcorrectie" hint="Hoger herstelt meer schade, maar maakt de code dichter.">
          <Segmented
            size="sm"
            value={niveau}
            onValueChange={setNiveau}
            options={[
              { value: "L", label: "L" },
              { value: "M", label: "M" },
              { value: "Q", label: "Q" },
              { value: "H", label: "H" },
            ]}
          />
        </Field>
      </div>

      <QrCode
        value={waarde}
        level={niveau as "L" | "M" | "Q" | "H"}
        size={168}
        caption="Scan met je telefoon"
      />
    </div>
  );
}
