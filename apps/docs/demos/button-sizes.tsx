"use client";
import { Button, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Button size="sm" icon={<Icon name="plus" />}>Klein</Button>
      <Button icon={<Icon name="plus" />}>Standaard</Button>
      <Button size="lg" iconRight={<Icon name="arrowRight" />}>Groot</Button>
      <Button variant="secondary" icon={<Icon name="settings" />} aria-label="Instellingen" />
      <Button variant="ghost" size="sm" icon={<Icon name="more" />} aria-label="Meer" />
    </>
  );
}
