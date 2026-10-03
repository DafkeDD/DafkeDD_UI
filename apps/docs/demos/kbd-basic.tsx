"use client";
import { Kbd } from "@dafke/ui";

export default function Demo() {
  return (
    <>
      <Kbd keys={["⌘", "K"]} />
      <Kbd keys={["Ctrl", "Shift", "P"]} />
      <Kbd>Esc</Kbd>
    </>
  );
}
