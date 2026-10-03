"use client";
import { ICON_NAMES, Icon } from "@dafke/ui";

export default function Demo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(94px, 1fr))", gap: 8 }}>
      {ICON_NAMES.map((name) => (
        <div
          key={name}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
            padding: "14px 6px", border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
            background: "var(--surface)",
          }}
        >
          <Icon name={name} size={20} />
          <span style={{ fontSize: 10.5, color: "var(--text-3)", fontFamily: "var(--mono)", textAlign: "center", wordBreak: "break-all" }}>
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}
