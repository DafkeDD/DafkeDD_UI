"use client";
import { useState } from "react";
import { RichEditor } from "@dafke/ui";

const START =
  "<p>Controle na <b>cataractoperatie</b> rechteroog. Patiënt meldt lichte wazigheid bij fel licht.</p>" +
  "<ul><li>Druk gemeten: 14 mmHg</li><li>Nacontrole over 6 weken</li></ul>";

export default function Demo() {
  const [html, setHtml] = useState(START);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <RichEditor
        defaultValue={START}
        onValueChange={setHtml}
        placeholder="Typ hier het verslag…"
        minHeight={150}
        footer="Gemaakt door Espeel Léonie op vrijdag 20 maart 2026 om 15:16"
      />
      <details style={{ fontSize: 12.5, color: "var(--text-3)" }}>
        <summary style={{ cursor: "pointer" }}>Opgeslagen HTML bekijken</summary>
        <pre
          style={{
            marginTop: 8, padding: 10, overflowX: "auto",
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)", fontFamily: "var(--mono)", fontSize: 11.5,
          }}
        >
          {html}
        </pre>
      </details>
    </div>
  );
}
