"use client";
import { useState } from "react";
import { Button, ConfettiBurst } from "@dafke/ui";

export default function Demo() {
  const [feest, setFeest] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <Button onClick={() => setFeest(true)}>Vier iets</Button>
      {feest && <ConfettiBurst count={22} spread={70} onDone={() => setFeest(false)} />}
    </span>
  );
}
