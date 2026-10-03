"use client";
import { Button, ToastProvider, useToast } from "@dafke/ui";

function Knoppen() {
  const toast = useToast();

  return (
    <>
      <Button onClick={() => toast.success("Tenant opgeslagen", { description: "De wijzigingen zijn meteen actief." })}>
        Succes
      </Button>
      <Button variant="secondary" onClick={() => toast.info("Synchronisatie gestart")}>Info</Button>
      <Button variant="secondary" onClick={() => toast.warning("Licentie verloopt binnen 7 dagen")}>Waarschuwing</Button>
      <Button
        variant="danger-soft"
        onClick={() =>
          toast.error("Factuur kon niet verstuurd worden", {
            description: "Het e-mailadres van de tenant ontbreekt.",
            action: { label: "Opnieuw", onClick: () => undefined },
            duration: 6000,
          })
        }
      >
        Fout met actie
      </Button>
    </>
  );
}

export default function Demo() {
  return (
    <ToastProvider>
      <Knoppen />
    </ToastProvider>
  );
}
