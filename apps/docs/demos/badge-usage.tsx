"use client";
import { Badge, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Badge tone="green" dot pulse>Live</Badge>
      <Badge tone="amber" dot>Wachtrij</Badge>
      <Badge tone="accent" icon={<Icon name="shield" size={12} />}>Geverifieerd</Badge>
      <Badge tone="neutral" size="sm">v0.1.0</Badge>
    </>
  );
}
