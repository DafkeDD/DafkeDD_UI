"use client";
import { useState } from "react";
import { Icon, ResizableGroup, ResizableHandle, ResizablePanel } from "@dafke/ui";

export default function Demo() {
  const [verdeling, setVerdeling] = useState([32, 68]);

  return (
    <div style={{ width: "100%" }}>
      <ResizableGroup
        defaultSizes={[32, 68]}
        onSizesChange={setVerdeling}
        style={{
          height: 260, border: "1px solid var(--border)",
          borderRadius: "var(--r-md)", background: "var(--surface)",
        }}
      >
        <ResizablePanel index={0} minSize={20} maxSize={60}>
          <div style={{ padding: 14 }}>
            <div className="lui-eyebrow" style={{ marginBottom: 10 }}>Patiënten</div>
            {["Jan Peeters", "Marie Dubois", "Ahmed Bakkali"].map((naam) => (
              <div key={naam} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", fontSize: 13 }}>
                <Icon name="user" size={14} />
                {naam}
              </div>
            ))}
          </div>
        </ResizablePanel>

        <ResizableHandle index={0} />

        <ResizablePanel index={1}>
          <div style={{ padding: 16 }}>
            <strong style={{ fontSize: 15 }}>Jan Peeters</strong>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8, lineHeight: 1.6 }}>
              Sleep de scheiding, of zet er de focus op en gebruik de pijltjestoetsen — met Shift gaat het in
              stappen van 10%.
            </p>
          </div>
        </ResizablePanel>
      </ResizableGroup>

      <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-3)" }}>
        Verdeling: {verdeling.map((deel) => `${Math.round(deel)}%`).join(" / ")}
      </p>
    </div>
  );
}
