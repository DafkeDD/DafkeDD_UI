"use client";
import { Field, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dafke/ui";

export default function Demo() {
  return (
    <Field label="Rol" hint="Bepaalt welke apps deze gebruiker ziet." style={{ maxWidth: 340 }}>
      <Select defaultValue="beheerder">
        <SelectTrigger>
          <SelectValue placeholder="Kies een rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beheerder">Beheerder</SelectItem>
          <SelectItem value="gebruiker">Gebruiker</SelectItem>
          <SelectItem value="lezer">Alleen lezen</SelectItem>
          <SelectItem value="extern" disabled>Externe partner</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
