"use client";
import { useState } from "react";
import { BottomNav, BottomNavItem, Icon, Text } from "@dafke/ui";

const ITEMS = [
  { id: "home", label: "Start", icon: "home" },
  { id: "zoek", label: "Zoeken", icon: "search" },
  { id: "chat", label: "Berichten", icon: "mail", badge: 3 },
  { id: "foto", label: "Foto's", icon: "camera" },
  { id: "meer", label: "Meer", icon: "settings" },
] as const;

export default function Demo() {
  const [actief, setActief] = useState("chat");

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Text variant="small" tone="muted">
        Klik de items aan: het actieve icoon tilt in een gekleurde bol boven de
        balk uit.
      </Text>

      <div
        style={{
          position: "relative",
          height: 130,
          borderRadius: 14,
          border: "1px solid var(--border)",
          background: "var(--surface-2)",
          overflow: "hidden",
        }}
      >
        <BottomNav
          always
          indicator="bubble"
          safeArea={false}
          style={{ position: "absolute", insetInline: 0, bottom: 0 }}
        >
          {ITEMS.map((item) => (
            <BottomNavItem
              key={item.id}
              icon={<Icon name={item.icon} size={20} />}
              active={actief === item.id}
              badge={"badge" in item ? item.badge : undefined}
              onClick={() => setActief(item.id)}
            >
              {item.label}
            </BottomNavItem>
          ))}
        </BottomNav>
      </div>
    </div>
  );
}
