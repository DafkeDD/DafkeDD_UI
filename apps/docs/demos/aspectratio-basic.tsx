"use client";
import { AspectRatio, Segmented } from "@dafke/ui";
import { useState } from "react";

export default function Demo() {
  const [soort, setSoort] = useState("16/9");
  const [breedte, hoogte] = soort.split("/").map(Number);

  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center", width: "100%", maxWidth: 420 }}>
      <Segmented
        size="sm"
        value={soort}
        onValueChange={setSoort}
        options={[
          { value: "16/9", label: "16:9" },
          { value: "4/3", label: "4:3" },
          { value: "1/1", label: "1:1" },
        ]}
      />
      <AspectRatio
        ratio={breedte / hoogte}
        style={{
          border: "1px solid var(--border)", borderRadius: "var(--r-md)",
          background: "var(--accent-tint)", display: "grid", placeItems: "center",
          color: "var(--accent)", fontWeight: 650, fontSize: 14,
        }}
      >
        {soort}
      </AspectRatio>
    </div>
  );
}
