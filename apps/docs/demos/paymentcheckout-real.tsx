"use client";
import { useState } from "react";
import { Badge } from "@dafke/ui";
import { PaymentCheckout } from "@dafke/ui/motion";

/** Zelf invullen: de kaart schrijft mee en draait om bij de CVC. */
export default function Demo() {
  const [status, setStatus] = useState("Kaarten die op 4 beginnen worden aanvaard.");

  return (
    <div style={{ display: "grid", gap: 14, width: "100%" }}>
      <PaymentCheckout
        amount={89.5}
        onPay={async (waarden) => {
          setStatus("Bezig met verwerken…");
          await new Promise((klaar) => setTimeout(klaar, 1200));
          const goed = waarden.number.startsWith("4");
          setStatus(goed ? "Betaling aanvaard." : "Kaart geweigerd.");
          return goed;
        }}
        onPaid={() => setStatus("Klaar — bestelling bevestigd.")}
      />
      <Badge tone="neutral">{status}</Badge>
    </div>
  );
}
