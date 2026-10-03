"use client";
import { AddToCartButton } from "@dafke/ui/motion";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
      <AddToCartButton />
      <AddToCartButton defaultCount={2} hint={null}>
        Nog een
      </AddToCartButton>
    </div>
  );
}
