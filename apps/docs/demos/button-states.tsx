"use client";
import { useState } from "react";
import { Button, ButtonGroup, Icon } from "@dafke/ui";

export default function Demo() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button
        loading={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1600);
        }}
      >
        {loading ? "Bezig…" : "Opslaan"}
      </Button>
      <Button disabled>Uitgeschakeld</Button>
      <ButtonGroup>
        <Button variant="secondary" icon={<Icon name="chevronLeft" />} aria-label="Vorige" />
        <Button variant="secondary">Vandaag</Button>
        <Button variant="secondary" icon={<Icon name="chevronRight" />} aria-label="Volgende" />
      </ButtonGroup>
    </>
  );
}
