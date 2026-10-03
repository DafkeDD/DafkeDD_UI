"use client";
import { useState } from "react";
import { Badge } from "@dafke/ui";
import { OtpVerification } from "@dafke/ui/motion";

/** De echte variant: jij controleert de code, een foute code schudt en wist. */
export default function Demo() {
  const [status, setStatus] = useState("Typ 1234 — de rest wordt afgekeurd.");

  return (
    <div style={{ display: "grid", gap: 14, justifyItems: "center" }}>
      <OtpVerification
        length={4}
        handle
        texts={{ title: "Bevestig je aanmelding", description: "Vul de code van je authenticator-app in." }}
        onVerify={async (code) => {
          setStatus("Aan het controleren…");
          await new Promise((klaar) => setTimeout(klaar, 600));
          const goed = code === "1234";
          setStatus(goed ? "Code aanvaard." : "Code geweigerd.");
          return goed;
        }}
        onVerified={() => setStatus("Klaar — je kan verder.")}
        onResend={() => setStatus("Nieuwe code verstuurd.")}
      />
      <Badge tone="neutral">{status}</Badge>
      <span style={{ fontSize: 12, color: "var(--text-3)" }}>
        Gewoon typen werkt ook zonder muis — het veld staat over de vakjes.
      </span>
    </div>
  );
}
