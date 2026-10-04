"use client";
import { useState } from "react";
import { EidReaderPicker } from "@dafke/ui";

const readers = [
  { name: "Alcor Micro USB Smart Card Reader 0", cardPresent: true },
  { name: "Gemalto PC Twin Reader 0", cardPresent: false },
];

export default function Demo() {
  const [reader, setReader] = useState(readers[0].name);

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <EidReaderPicker readers={readers} value={reader} onValueChange={setReader} />
      <EidReaderPicker readers={[]} />
    </div>
  );
}
