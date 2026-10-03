"use client";
import { useState } from "react";
import { Combobox, Field, Icon } from "@dafke/ui";

const TENANTS = [
  { value: "itworxs", label: "ITWORXS BV", description: "BE 0123.456.789", group: "Actief", icon: <Icon name="building" size={16} /> },
  { value: "dafke", label: "Dafke NV", description: "BE 0987.654.321", group: "Actief", icon: <Icon name="building" size={16} /> },
  { value: "delta", label: "Delta Solutions", description: "BE 0555.123.456", group: "Actief", icon: <Icon name="building" size={16} /> },
  { value: "oud", label: "Oude Zaak BVBA", description: "Opgeheven in 2023", group: "Gearchiveerd", disabled: true, icon: <Icon name="building" size={16} /> },
];

export default function Demo() {
  const [value, setValue] = useState("itworxs");

  return (
    <Field label="Tenant" hint={`Gekozen: ${value || "geen"}`} style={{ maxWidth: 360 }}>
      <Combobox options={TENANTS} value={value} onValueChange={setValue} clearable placeholder="Kies een tenant" />
    </Field>
  );
}
