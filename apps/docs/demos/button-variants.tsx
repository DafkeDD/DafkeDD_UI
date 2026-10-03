"use client";
import { Button } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Button>Primair</Button>
      <Button variant="secondary">Secundair</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Verwijderen</Button>
      <Button variant="danger-soft">Intrekken</Button>
      <Button variant="link">Meer info</Button>
    </>
  );
}
