"use client";
import { OrderButton } from "@dafke/ui/motion";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      <OrderButton onOrder={async () => { await new Promise((k) => setTimeout(k, 900)); }}>
        Nu bestellen
      </OrderButton>
      <OrderButton orderedLabel="Onderweg" resetAfter={false}>
        Bezorging plannen
      </OrderButton>
    </div>
  );
}
