"use client";
import { useState } from "react";
import {
  Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Field, Icon, Input, Select,
  SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, ModalProvider, createModals, useModal,
} from "@dafke/ui";

/* ---------- 1. Elke modal is een gewoon component met onClose ---------- */
function VoorschriftModal({ patient, onClose }: { patient: string; onClose: () => void }) {
  const modal = useModal<typeof MODALS>();
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw voorschrift</DialogTitle>
          <DialogDescription>Voor {patient}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div style={{ display: "grid", gap: 16 }}>
            <Field label="Geneesmiddel" required>
              <Select defaultValue="latanoprost">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="latanoprost">Latanoprost 0,005%</SelectItem>
                  <SelectItem value="timolol">Timolol 0,5%</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Posologie">
              <Input defaultValue="1 druppel 's avonds" />
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuleren</Button>
          <Button onClick={() => modal.open("bevestig", { titel: "Voorschrift ondertekenen?" })}>
            Voorschrijven
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotitieModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Snelle notitie</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Textarea autoFocus placeholder="Typ je notitie…" rows={4} />
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuleren</Button>
          <Button onClick={onClose}>Bewaren</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BevestigModal({ titel, onClose }: { titel: string; onClose: () => void }) {
  const modal = useModal<typeof MODALS>();
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{titel}</DialogTitle>
          <DialogDescription>
            Deze dialog staat bovenop de vorige. Sluiten brengt je terug bij het formulier eronder.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Terug</Button>
          <Button variant="danger" onClick={() => modal.closeAll()}>Alles sluiten</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- 2. Eén register ---------- */
const MODALS = createModals({
  voorschrift: VoorschriftModal,
  notitie: NotitieModal,
  bevestig: BevestigModal,
});

/* ---------- 3. Overal openen met useModal() ---------- */
function Acties() {
  const modal = useModal<typeof MODALS>();
  const [laatste, setLaatste] = useState<string | null>(null);

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button
          icon={<Icon name="plus" />}
          onClick={() => {
            modal.open("voorschrift", { patient: "Lisa Vanreppelen" });
            setLaatste("voorschrift");
          }}
        >
          Voorschrift
        </Button>
        <Button variant="secondary" icon={<Icon name="edit" />} onClick={() => modal.open("notitie")}>
          Notitie
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" iconRight={<Icon name="chevronDown" />}>Vanuit een menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem icon={<Icon name="file" />} onClick={() => modal.open("voorschrift", { patient: "Jean-Pierre Dewitte" })}>
              Voorschrift voor Dewitte
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Icon name="alert" />} onClick={() => modal.open("bevestig", { titel: "Consultatie afsluiten?" })}>
              Consultatie afsluiten
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-3)" }}>
        Open staan: <strong>{modal.stack.length}</strong>
        {modal.stack.length > 0 && ` (${modal.stack.map((entry) => entry.kind).join(" › ")})`}
        {laatste && ` · laatst geopend: ${laatste}`}
      </p>
    </div>
  );
}

export default function Demo() {
  return (
    <ModalProvider modals={MODALS}>
      <Acties />
    </ModalProvider>
  );
}
