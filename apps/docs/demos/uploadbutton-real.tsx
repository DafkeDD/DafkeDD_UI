"use client";
import { useState } from "react";
import { Badge } from "@dafke/ui";
import { UploadButton } from "@dafke/ui/motion";

/** Met een echte upload: jij bepaalt de voortgang en of het lukt. */
export default function Demo() {
  const [status, setStatus] = useState("Nog niets verstuurd.");

  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center", width: "100%" }}>
      <UploadButton
        resetAfter={false}
        texts={{ placeholder: "Sleep je verslag hierheen of klik", upload: "Versturen" }}
        onUpload={async (file, voortgang) => {
          for (let deel = 0; deel <= 10; deel += 1) {
            await new Promise((klaar) => setTimeout(klaar, 120));
            voortgang(deel / 10);
            setStatus(`${file.name} — ${deel * 10}%`);
          }
          const goed = file.size < 5 * 1024 * 1024;
          setStatus(goed ? `${file.name} is opgeslagen.` : "Te groot: maximaal 5 MB.");
          return goed;
        }}
      />
      <Badge tone="neutral">{status}</Badge>
    </div>
  );
}
