"use client";
import { useState } from "react";
import { Field, PhoneInput, Stack, Text } from "@dafke/ui";

export default function Demo() {
  const [nummer, setNummer] = useState("+32470123456");
  const [tweede, setTweede] = useState("");

  return (
    <Stack gap="lg" style={{ maxWidth: 360 }}>
      <Field label="Gsm" hint="De waarde wordt als E.164 doorgegeven.">
        <PhoneInput value={nummer} onValueChange={setNummer} />
      </Field>

      <Field label="Vaste lijn" hint="Begin met + en een landnummer om het land te wisselen.">
        <PhoneInput value={tweede} onValueChange={setTweede} defaultCountry="NL" />
      </Field>

      <Text variant="small" tone="muted">
        Waarden: <code>{nummer || "—"}</code> · <code>{tweede || "—"}</code>
      </Text>
    </Stack>
  );
}
