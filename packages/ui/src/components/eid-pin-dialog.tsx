"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "./dialog";
import { Field } from "./field";
import { Input } from "./input";

export interface EidPinDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Krijgt de PIN; geef hem meteen door aan `login()` van `useEidLogin()`. */
  onSubmit: (pin: string) => void;
  /** `status` van `useEidLogin()`: tijdens "signing" is het formulier vergrendeld. */
  status?: "idle" | "signing" | "done" | "error";
  /** `error` van `useEidLogin()`. */
  error?: { code?: string; message: string } | null;
  /** Resterende pogingen na een verkeerde PIN. */
  triesLeft?: number | null;
  /** Naam van de kaartlezer. */
  reader?: string | null;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Kortste PIN. Standaard 4. */
  minLength?: number;
  /** Langste PIN. Standaard 12. */
  maxLength?: number;
  className?: string;
}

function errorText(error: { code?: string; message: string }, triesLeft: number | null | undefined): string {
  switch (error.code) {
    case "pin-incorrect":
      return triesLeft === 1
        ? "Verkeerde PIN. Nog 1 poging, daarna wordt je kaart geblokkeerd."
        : triesLeft != null
          ? `Verkeerde PIN. Nog ${triesLeft} pogingen.`
          : "Verkeerde PIN.";
    case "pin-blocked":
      return "Je PIN is geblokkeerd. Deblokkeer hem met je PUK-code bij je gemeente.";
    case "no-card":
    case "card-removed":
      return "De kaart is uit de lezer gehaald. Steek ze er opnieuw in.";
    case "auth-not-allowed":
      return "Deze website mag niet aanmelden via het eID-programma.";
    case "pin-cancelled":
      return "Aanmelden is geannuleerd.";
    default:
      return error.message;
  }
}

/**
 * EidPinDialog — vraagt de PIN van de eID om aan te melden. De PIN blijft alleen in dit
 * venster zolang je typt: na het versturen wordt het veld leeggemaakt. Koppel `status`,
 * `error` en `triesLeft` aan `useEidLogin()` uit @dafkedd/eid.
 */
export function EidPinDialog({
  open,
  onOpenChange,
  onSubmit,
  status = "idle",
  error,
  triesLeft,
  reader,
  title = "Aanmelden met je eID",
  description = "Typ de PIN-code van je identiteitskaart. Die gaat rechtstreeks naar de kaart.",
  minLength = 4,
  maxLength = 12,
  className,
}: EidPinDialogProps) {
  const [pin, setPin] = React.useState("");
  const signing = status === "signing";
  const blocked = error?.code === "pin-blocked";
  const valid = pin.length >= minLength && pin.length <= maxLength;
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Nooit een PIN laten staan als het venster sluit of opnieuw opent.
  React.useEffect(() => {
    setPin("");
  }, [open]);

  // Na een fout opnieuw focussen, zodat de gebruiker meteen kan typen.
  React.useEffect(() => {
    if (status === "error" && !blocked) inputRef.current?.focus();
  }, [status, blocked]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || signing || blocked) return;
    const value = pin;
    setPin("");
    onSubmit(value);
  };

  const message = error ? errorText(error, triesLeft) : undefined;

  return (
    <Dialog open={open} onOpenChange={(next) => !signing && onOpenChange?.(next)}>
      <DialogContent size="sm" static={signing} hideClose={signing} className={cn("lui-eid-pin", className)}>
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <span className="lui-eid-pin-icon" aria-hidden="true">
              <Icon name="key" size={20} />
            </span>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field label="PIN-code" error={message} hint={reader ? `Lezer: ${reader}` : undefined}>
              <Input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="off"
                autoFocus
                maxLength={maxLength}
                value={pin}
                disabled={signing || blocked}
                className="lui-eid-pin-input"
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, maxLength))}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" disabled={signing} onClick={() => onOpenChange?.(false)}>
              Annuleren
            </Button>
            <Button type="submit" loading={signing} disabled={!valid || blocked}>
              {signing ? "Bezig met ondertekenen…" : "Aanmelden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
