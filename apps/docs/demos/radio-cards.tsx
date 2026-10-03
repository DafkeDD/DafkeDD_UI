"use client";
import { Radio, RadioGroup } from "@dafke/ui";

export default function Demo() {
  return (
    <RadioGroup defaultValue="eid" orientation="horizontal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      <Radio card value="eid" label="eID" description="Met kaartlezer" />
      <Radio card value="itsme" label="itsme®" description="Via de app" />
      <Radio card value="mail" label="E-mail" description="Met verificatiecode" />
    </RadioGroup>
  );
}
