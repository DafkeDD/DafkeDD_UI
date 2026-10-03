"use client";
import { useState } from "react";
import { Badge, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@dafke/ui";

export default function Demo() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ width: "100%", maxWidth: 460 }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger chevron>
          Eerdere afspraken
          <Badge tone="accent" size="sm">3</Badge>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div style={{ display: "grid", gap: 8, padding: "8px 10px 10px" }}>
            {["12/03 — controle OD", "04/02 — cataractoperatie", "18/01 — eerste consult"].map((regel) => (
              <div
                key={regel}
                style={{
                  padding: "9px 12px", border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)", background: "var(--surface)", fontSize: 13,
                }}
              >
                {regel}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
