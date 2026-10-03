"use client";
import { Badge, Icon, MockupBrowser, MockupPhone, MockupWindow, Segmented } from "@dafke/ui";
import { useState } from "react";

export default function Demo() {
  const [soort, setSoort] = useState("browser");

  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center", width: "100%" }}>
      <Segmented
        size="sm"
        value={soort}
        onValueChange={setSoort}
        options={[
          { value: "browser", label: "Browser" },
          { value: "window", label: "Venster" },
          { value: "phone", label: "Telefoon" },
        ]}
      />

      {soort === "browser" && (
        <MockupBrowser url="https://praktijk.dafke.be/agenda" style={{ width: "100%", maxWidth: 520 }}>
          <Scherm />
        </MockupBrowser>
      )}

      {soort === "window" && (
        <MockupWindow title="Dafke — Dossier Peeters" style={{ width: "100%", maxWidth: 520 }}>
          <Scherm />
        </MockupWindow>
      )}

      {soort === "phone" && (
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
            <MockupPhone width={230} time="9:41">
              <Scherm compact />
            </MockupPhone>
            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>top=&quot;island&quot;</span>
          </div>
          <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
            <MockupPhone width={230} top="notch" frameColor="#a06a3c">
              <Scherm compact />
            </MockupPhone>
            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>top=&quot;notch&quot; + frameColor</span>
          </div>
          <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
            <MockupPhone width={230} screen="#0b0b0f">
              <div
                style={{
                  height: "100%", display: "grid", placeItems: "center",
                  color: "#fff", fontSize: 15, letterSpacing: "-0.01em",
                }}
              >
                Vergrendeld
              </div>
            </MockupPhone>
            <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>screen=&quot;#0b0b0f&quot;</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Scherm({ compact }: { compact?: boolean }) {
  return (
    <div style={{ padding: compact ? 14 : 20, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="calendar" size={16} />
        <strong style={{ fontSize: compact ? 13 : 14.5 }}>Agenda</strong>
        <span style={{ flex: 1 }} />
        <Badge tone="accent" size="sm">4</Badge>
      </div>
      {["09:00 Jan Peeters", "10:30 Marie Dubois", "14:00 Controle OD"].map((regel) => (
        <div
          key={regel}
          style={{
            padding: compact ? "8px 10px" : "10px 12px",
            border: "1px solid var(--border)", borderRadius: "var(--r-sm)",
            background: "var(--surface-2)", fontSize: compact ? 11.5 : 13,
          }}
        >
          {regel}
        </div>
      ))}
    </div>
  );
}
