"use client";
import { useState } from "react";
import { Icon, Segmented } from "@dafke/ui";

export default function Demo() {
  const [view, setView] = useState("lijst");

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 420 }}>
      <Segmented
        value={view}
        onValueChange={setView}
        options={[
          { value: "lijst", label: "Lijst", icon: <Icon name="menu" /> },
          { value: "raster", label: "Raster", icon: <Icon name="dashboard" /> },
          { value: "kaart", label: "Kaart", icon: <Icon name="globe" /> },
        ]}
      />
      <Segmented
        size="sm"
        options={[
          { value: "alle", label: "Alle" },
          { value: "open", label: "Open" },
          { value: "gesloten", label: "Gesloten" },
        ]}
      />
      <Segmented
        block
        options={[
          { value: "maand", label: "Maandelijks" },
          { value: "jaar", label: "Jaarlijks" },
        ]}
      />
    </div>
  );
}
