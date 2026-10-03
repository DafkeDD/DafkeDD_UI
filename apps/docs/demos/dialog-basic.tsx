"use client";
import {
  Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@dafke/ui";

export default function Demo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Tenant verwijderen</Button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Tenant verwijderen?</DialogTitle>
          <DialogDescription>
            Alle gebruikers, licenties en facturen van deze tenant worden losgekoppeld. Dit kan niet ongedaan gemaakt worden.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuleren</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="danger">Definitief verwijderen</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
