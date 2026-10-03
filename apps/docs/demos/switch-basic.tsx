"use client";
import { useState } from "react";
import { Switch } from "@dafke/ui";

export default function Demo() {
  const [on, setOn] = useState(true);

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Switch checked={on} onCheckedChange={setOn} label="Tweestapsverificatie" description="Vraag een code bij elke nieuwe login." />
      <Switch size="sm" defaultChecked label="Compacte weergave" />
      <Switch labelPosition="left" label="Notificaties per e-mail" />
      <Switch disabled label="Uitgeschakeld" />
    </div>
  );
}
