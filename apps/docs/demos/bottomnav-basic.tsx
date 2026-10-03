"use client";
import { useState } from "react";
import { BottomNav, BottomNavItem, Icon } from "@dafke/ui";

const ITEMS = [
  { key: "planning", label: "Planning", icon: "calendar" as const },
  { key: "verlof", label: "Verlof", icon: "sun" as const, badge: 3 },
  { key: "taken", label: "Taken", icon: "check" as const },
  { key: "docs", label: "Docs", icon: "file" as const },
];

export default function Demo() {
  const [actief, setActief] = useState("planning");

  return (
    // translate maakt van dit kader het referentievlak voor de vaste balk,
    // zodat de demo binnen het voorbeeld blijft in plaats van onderaan het scherm.
    <div
      style={{
        position: "relative", transform: "translateZ(0)", width: 300, height: 380,
        border: "1px solid var(--border)", borderRadius: 26, overflow: "hidden",
        background: "var(--surface-2)",
      }}
    >
      <div style={{ padding: "20px 18px", fontSize: 13.5, color: "var(--text-2)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
          {ITEMS.find((item) => item.key === actief)?.label}
        </div>
        <p style={{ marginTop: 8 }}>Tik onderaan om van weergave te wisselen.</p>
      </div>

      <BottomNav always>
        {ITEMS.map((item) => (
          <BottomNavItem
            key={item.key}
            icon={<Icon name={item.icon} size={20} />}
            active={actief === item.key}
            badge={item.badge}
            onClick={() => setActief(item.key)}
          >
            {item.label}
          </BottomNavItem>
        ))}
      </BottomNav>
    </div>
  );
}
