"use client";
import { Icon } from "@dafke/ui";
import { Dock, DockItem } from "@dafke/ui/motion";

const ITEMS = [
  { icon: "home", label: "Start", active: true },
  { icon: "search", label: "Zoeken" },
  { icon: "calendar", label: "Agenda" },
  { icon: "mail", label: "Berichten", active: true },
  { icon: "chart", label: "Rapporten" },
  { icon: "settings", label: "Instellingen" },
] as const;

export default function Demo() {
  return (
    <div style={{ display: "grid", placeItems: "center", padding: "40px 0 10px" }}>
      <Dock>
        {ITEMS.map((item) => (
          <DockItem key={item.label} label={item.label} active={"active" in item ? item.active : undefined}>
            <Icon name={item.icon} size={24} />
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}
