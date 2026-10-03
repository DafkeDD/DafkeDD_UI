"use client";
import { useState } from "react";
import { Icon } from "@dafke/ui";
import { MotionSegmented } from "@dafke/ui/motion";

export default function Demo() {
  const [weergave, setWeergave] = useState("dag");

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
      <MotionSegmented
        value={weergave}
        onValueChange={setWeergave}
        options={[
          { value: "dag", label: "Dag", icon: <Icon name="calendar" /> },
          { value: "week", label: "Week", icon: <Icon name="layers" /> },
          { value: "maand", label: "Maand", icon: <Icon name="grip" /> },
        ]}
      />
      <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>Weergave: {weergave}</span>
    </div>
  );
}
