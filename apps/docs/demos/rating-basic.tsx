"use client";
import { useState } from "react";
import { Rating } from "@dafke/ui";

export default function Demo() {
  const [score, setScore] = useState(3.5);

  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "center" }}>
      <Rating value={score} onValueChange={setScore} half size={24} caption={`${score.toFixed(1)} van 5`} />
      <Rating value={4} readOnly size={15} caption="4,0 · 18 beoordelingen" />
      <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>
        Klik op de linkerhelft van een ster voor een halve punt, of gebruik de pijltjestoetsen.
      </span>
    </div>
  );
}
