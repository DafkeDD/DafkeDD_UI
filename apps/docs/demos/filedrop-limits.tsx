"use client";
import { useState } from "react";
import { FileDrop, FileItem, Stack, Text } from "@dafke/ui";

export default function Demo() {
  const [bestanden, setBestanden] = useState<Array<{ name: string; size: number }>>([]);

  return (
    <Stack gap="md" style={{ maxWidth: 440 }}>
      <FileDrop
        accept=".pdf,.doc,.docx"
        multiple
        maxSize={1024 * 1024}
        maxFiles={3}
        hint="PDF, DOC of DOCX · hoogstens 1 MB per bestand"
        title="Sleep je documenten hierheen"
        onFiles={(files) =>
          setBestanden((vorige) => [
            ...vorige,
            ...files.map((file) => ({ name: file.name, size: file.size })),
          ])
        }
      />

      {bestanden.length > 0 && (
        <Stack gap="xs">
          {bestanden.map((bestand, index) => (
            <FileItem
              key={`${bestand.name}-${index}`}
              name={bestand.name}
              size={bestand.size}
              onRemove={() => setBestanden((vorige) => vorige.filter((_, i) => i !== index))}
            />
          ))}
        </Stack>
      )}

      <Text variant="small" tone="muted">
        Probeer een afbeelding of iets van meer dan 1 MB: de zone schudt even en
        vertelt wat er mis is, zonder het bestand door te geven.
      </Text>
    </Stack>
  );
}
