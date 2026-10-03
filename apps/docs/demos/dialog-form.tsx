"use client";
import {
  Button, Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger, Field, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@dafke/ui";

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Gebruiker uitnodigen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gebruiker uitnodigen</DialogTitle>
          <DialogDescription>De uitnodiging blijft 7 dagen geldig.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="E-mailadres" required>
              <Input type="email" placeholder="naam@bedrijf.be" />
            </Field>
            <Field label="Rol">
              <Select defaultValue="gebruiker">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beheerder">Beheerder</SelectItem>
                  <SelectItem value="gebruiker">Gebruiker</SelectItem>
                  <SelectItem value="lezer">Alleen lezen</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuleren</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Uitnodiging versturen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
