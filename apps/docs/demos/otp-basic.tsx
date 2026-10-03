"use client";
import { useState } from "react";
import { Field, OtpInput } from "@dafke/ui";

export default function Demo() {
  const [code, setCode] = useState("");
  const invalid = code.length === 6 && code !== "123456";

  return (
    <Field
      label="Verificatiecode"
      hint="Tip: 123456 is de juiste code in deze demo."
      error={invalid ? "Deze code klopt niet." : undefined}
      style={{ maxWidth: 380 }}
    >
      <OtpInput value={code} onValueChange={setCode} invalid={invalid} />
    </Field>
  );
}
