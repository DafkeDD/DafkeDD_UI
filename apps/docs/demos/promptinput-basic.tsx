"use client";
import { useState } from "react";
import { Badge, Kbd, PromptInput, Stack, Text } from "@dafke/ui";

export default function Demo() {
  const [tekst, setTekst] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [laatste, setLaatste] = useState<string | null>(null);
  const [bijlagen, setBijlagen] = useState([
    { id: "1", name: "offerte-devries.pdf", size: 284_512 },
  ]);

  return (
    <Stack gap="md" style={{ maxWidth: 620 }}>
      <PromptInput
        value={tekst}
        onValueChange={setTekst}
        maxLength={2000}
        attachments={bijlagen}
        onRemoveAttachment={(id) => setBijlagen((v) => v.filter((b) => b.id !== id))}
        onAttach={() =>
          setBijlagen((v) => [...v, { id: String(Date.now()), name: "notities.md", size: 4_210 }])
        }
        streaming={streaming}
        onStop={() => setStreaming(false)}
        onSubmit={(waarde) => {
          setLaatste(waarde);
          setTekst("");
          setStreaming(true);
          window.setTimeout(() => setStreaming(false), 2200);
        }}
        suggestions={["Vat de offerte samen", "Stel drie vragen aan de klant", "Maak er een e-mail van"]}
        toolbar={<Badge tone="neutral" size="sm">gpt-mini</Badge>}
        hint={
          <>
            <Kbd>Enter</Kbd> verstuurt
          </>
        }
      />

      {laatste && (
        <Text variant="small" tone="muted">
          Laatst verstuurd: {laatste}
        </Text>
      )}
    </Stack>
  );
}
