"use client";
import { useRef, useState } from "react";
import { Button, Icon, Signature, Stack, Text, type SignatureHandle } from "@dafke/ui";

export default function Demo() {
  const pad = useRef<SignatureHandle>(null);
  const [leeg, setLeeg] = useState(true);
  const [beeld, setBeeld] = useState<string | null>(null);

  return (
    <Stack gap="md" style={{ maxWidth: 440 }}>
      <Signature ref={pad} onChange={setLeeg} guideLabel="Handtekening klant" />

      <Button
        size="sm"
        disabled={leeg}
        onClick={() => setBeeld(pad.current?.toDataURL() ?? null)}
        style={{ alignSelf: "flex-start" }}
      >
        <Icon name="download" size={15} />
        Vastleggen
      </Button>

      {beeld && (
        <Stack gap="xs">
          <Text variant="small" tone="muted">
            Vastgelegd als PNG:
          </Text>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beeld}
            alt="Vastgelegde handtekening"
            style={{ width: 200, border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface-2)" }}
          />
        </Stack>
      )}
    </Stack>
  );
}
