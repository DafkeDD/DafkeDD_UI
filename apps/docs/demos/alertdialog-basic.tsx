"use client";
import { useState } from "react";
import { AlertDialog, Button, ConfirmProvider, Icon, useConfirm } from "@dafke/ui";

export default function Demo() {
  return (
    <ConfirmProvider>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <LosseDialoog />
        <ViaHook />
      </div>
    </ConfirmProvider>
  );
}

/** Variant 1: de dialoog zelf plaatsen. */
function LosseDialoog() {
  const [open, setOpen] = useState(false);
  const [verwijderd, setVerwijderd] = useState(false);

  return (
    <>
      <Button variant="danger" icon={<Icon name="trash" />} onClick={() => setOpen(true)}>
        {verwijderd ? "Opnieuw" : "Afspraak verwijderen"}
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        destructive
        title="Afspraak verwijderen?"
        description="De afspraak van 14:00 met Jan Peeters wordt geannuleerd. De patiënt krijgt hier geen bericht van."
        confirmLabel="Verwijderen"
        onConfirm={async () => {
          // Doet alsof er iets naar de server gaat; de knop blijft laden.
          await new Promise((klaar) => setTimeout(klaar, 900));
          setVerwijderd(true);
        }}
      />
    </>
  );
}

/** Variant 2: als belofte, zonder zelf state bij te houden. */
function ViaHook() {
  const confirm = useConfirm();
  const [resultaat, setResultaat] = useState<string>();

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
      <Button
        variant="secondary"
        onClick={async () => {
          const ja = await confirm({
            title: "Dossier archiveren?",
            description: "Je kan het later terugzetten via het archief.",
            confirmLabel: "Archiveren",
          });
          setResultaat(ja ? "gearchiveerd" : "geannuleerd");
        }}
      >
        useConfirm()
      </Button>
      {resultaat && <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{resultaat}</span>}
    </div>
  );
}
