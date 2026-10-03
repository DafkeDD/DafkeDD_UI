"use client";
import { useState } from "react";
import { Checkbox } from "@dafke/ui";

export default function Demo() {
  const [items, setItems] = useState([true, false, false]);
  const all = items.every(Boolean);
  const some = items.some(Boolean) && !all;

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
      <Checkbox
        label="Alle apps selecteren"
        checked={all}
        indeterminate={some}
        onChange={() => setItems(items.map(() => !all))}
      />
      <div style={{ display: "grid", gap: 12, paddingLeft: 28 }}>
        {["Facturatie", "Vault", "Tickets"].map((name, index) => (
          <Checkbox
            key={name}
            label={name}
            checked={items[index]}
            onChange={() => setItems(items.map((value, i) => (i === index ? !value : value)))}
          />
        ))}
      </div>
      <Checkbox
        label="Nieuwsbrief ontvangen"
        description="Maximaal één mail per maand over nieuwe apps."
      />
      <Checkbox label="Uitgeschakeld" disabled defaultChecked />
    </div>
  );
}
