"use client";
import { useState } from "react";
import { Field, Input, PhoneInput, Stack, Text, Textarea } from "@dafke/ui";

export default function Demo() {
  const [mail, setMail] = useState("");
  const geldig = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail);

  return (
    <Stack gap="lg" style={{ maxWidth: 380 }}>
      <Field label="Naam" floating>
        <Input placeholder=" " />
      </Field>

      <Field
        label="E-mail"
        floating
        error={mail && !geldig ? "Geen geldig e-mailadres" : undefined}
      >
        <Input
          type="email"
          placeholder=" "
          value={mail}
          onChange={(event) => setMail(event.target.value)}
        />
      </Field>

      <Field label="Telefoon" floating>
        <PhoneInput placeholder=" " showExample={false} />
      </Field>

      <Field label="Bericht" floating>
        <Textarea placeholder=" " rows={3} />
      </Field>

      <Text variant="small" tone="muted">
        Het label staat middenin zolang het veld leeg is en klimt naar de rand
        bij focus of inhoud. Volledig in CSS via :placeholder-shown, dus geef het
        veld wel een placeholder (een spatie volstaat).
      </Text>
    </Stack>
  );
}
