"use client";
import { useState } from "react";
import {
  Field, Fieldset, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
} from "@dafke/ui";

export default function Demo() {
  const [uit, setUit] = useState(false);

  return (
    <div style={{ display: "grid", gap: 14, width: "100%", maxWidth: 460 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
        <Switch checked={uit} onCheckedChange={setUit} />
        Hele groep uitschakelen
      </label>

      <Fieldset
        bordered
        disabled={uit}
        legend="Contactgegevens"
        description="Wordt gebruikt voor afspraakherinneringen."
      >
        <Field label="E-mail">
          <Input type="email" defaultValue="jan.peeters@example.be" />
        </Field>
        <Fieldset row>
          <Field label="Telefoon">
            <Input defaultValue="0470 12 34 56" />
          </Field>
          <Field label="Voorkeur">
            <Select defaultValue="sms">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sms">Sms</SelectItem>
                <SelectItem value="mail">E-mail</SelectItem>
                <SelectItem value="geen">Geen</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Fieldset>
      </Fieldset>
    </div>
  );
}
