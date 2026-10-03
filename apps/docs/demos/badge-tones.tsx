"use client";
import { Badge } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Badge>Neutraal</Badge>
      <Badge tone="accent">Actief</Badge>
      <Badge tone="green">Betaald</Badge>
      <Badge tone="amber">In behandeling</Badge>
      <Badge tone="red">Vervallen</Badge>
      <Badge tone="blue">Nieuw</Badge>
      <Badge tone="violet">Pro</Badge>
    </>
  );
}
