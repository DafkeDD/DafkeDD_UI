"use client";
import { useState } from "react";
import { Field, Icon, Stack, Text, Textarea } from "@dafke/ui";

function Tool({ name, label }: { name: "heart" | "link" | "image"; label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      style={{
        display: "grid",
        placeItems: "center",
        width: 26,
        height: 26,
        padding: 0,
        border: 0,
        borderRadius: 6,
        background: "transparent",
        color: "inherit",
        cursor: "pointer",
      }}
    >
      <Icon name={name} size={15} />
    </button>
  );
}

export default function Demo() {
  const [tekst, setTekst] = useState(
    "Een textarea die meegroeit, met een teller die rood kleurt zodra je over de grens gaat."
  );

  return (
    <Stack gap="md" style={{ maxWidth: 440 }}>
      <Field label="Bericht">
        <Textarea
          value={tekst}
          onChange={(event) => setTekst(event.target.value)}
          placeholder="Deel je gedachten…"
          autoResize
          maxRows={8}
          maxLength={150}
          counter
          progress
          toolbar={
            <>
              <Tool name="heart" label="Emoji" />
              <Tool name="link" label="Bijlage" />
              <Tool name="image" label="Afbeelding" />
            </>
          }
        />
      </Field>
      <Text variant="small" tone="muted">
        Typ door tot voorbij de 150 tekens: de teller en het balkje kleuren rood.
      </Text>
    </Stack>
  );
}
