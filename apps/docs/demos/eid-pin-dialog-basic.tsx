"use client";
import { useState } from "react";
import { Button, EidPinDialog } from "@dafke/ui";

type Status = "idle" | "signing" | "done" | "error";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [tries, setTries] = useState(3);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  // Doet alsof login() van useEidLogin() de kaart laat ondertekenen.
  const login = (pin: string) => {
    setStatus("signing");
    setError(null);
    setTimeout(() => {
      if (pin === "1234") {
        setStatus("done");
        setTries(3);
        setOpen(false);
        return;
      }
      const left = tries - 1;
      setTries(left);
      setStatus("error");
      setError(left > 0 ? { code: "pin-incorrect", message: "Verkeerde PIN" } : { code: "pin-blocked", message: "PIN geblokkeerd" });
    }, 900);
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button
        onClick={() => {
          setStatus("idle");
          setError(null);
          setOpen(true);
        }}
      >
        Aanmelden met eID
      </Button>
      {status === "done" && <span>Aangemeld.</span>}
      <EidPinDialog
        open={open}
        onOpenChange={setOpen}
        onSubmit={login}
        status={status}
        error={error}
        triesLeft={error ? tries : null}
        reader="Alcor Micro USB Smart Card Reader 0"
      />
    </div>
  );
}
