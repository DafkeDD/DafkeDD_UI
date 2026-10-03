"use client";
import { Button, Icon, Tooltip } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Tooltip content="Boven" side="top">
        <Button variant="secondary">Boven</Button>
      </Tooltip>
      <Tooltip content="Rechts" side="right">
        <Button variant="secondary">Rechts</Button>
      </Tooltip>
      <Tooltip content="Onder" side="bottom">
        <Button variant="secondary">Onder</Button>
      </Tooltip>
      <Tooltip content="Links" side="left">
        <Button variant="secondary">Links</Button>
      </Tooltip>
      <Tooltip content="Deze tenant is geverifieerd via de KBO.">
        <Button variant="ghost" icon={<Icon name="help" />} aria-label="Uitleg" />
      </Tooltip>
    </>
  );
}
