"use client";
import { useState } from "react";
import { FileDrop, FileItem } from "@dafke/ui";

export default function Demo() {
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([
    { name: "certificaat-2026.pfx", size: 48213 },
  ]);

  return (
    <div style={{ display: "grid", gap: 14, maxWidth: 520 }}>
      <FileDrop
        multiple
        accept=".pdf,.png,.pfx"
        onFiles={(dropped) => setFiles((prev) => [...prev, ...dropped.map((f) => ({ name: f.name, size: f.size }))])}
        description="PDF, PNG of PFX — max. 10 MB per bestand"
      />
      {files.map((file, index) => (
        <FileItem
          key={`${file.name}-${index}`}
          name={file.name}
          size={file.size}
          onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
        />
      ))}
    </div>
  );
}
