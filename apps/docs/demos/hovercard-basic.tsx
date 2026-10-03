"use client";
import { Avatar, Badge, HoverCard, HoverCardContent, HoverCardTrigger, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.9, maxWidth: 440, textAlign: "center" }}>
      Vanmiddag om 14:00 heeft{" "}
      <HoverCard>
        <HoverCardTrigger>Jan Peeters</HoverCardTrigger>
        <HoverCardContent width={300}>
          <div style={{ display: "flex", gap: 12 }}>
            <Avatar name="Jan Peeters" size={44} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 14 }}>Jan Peeters</strong>
                <Badge tone="green" size="sm">actief</Badge>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>
                °14/03/1968 · rijksregister 68.03.14-123.45
              </div>
              <div style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 12.5, color: "var(--text-2)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="calendar" size={13} /> Laatste consult: 8 februari
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="alert" size={13} /> Allergie: penicilline
                </span>
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      een controle na zijn cataractoperatie.
    </p>
  );
}
