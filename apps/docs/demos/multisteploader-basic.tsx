"use client";
import { useState } from "react";
import { Button, Stack } from "@dafke/ui";
import { MultiStepLoader } from "@dafke/ui/motion";

export default function Demo() {
  const [bezig, setBezig] = useState(false);

  return (
    <Stack gap="lg">
      <Button onClick={() => setBezig(true)} disabled={bezig} style={{ alignSelf: "flex-start" }}>
        Importeren starten
      </Button>

      <MultiStepLoader
        loading={bezig}
        title="Bestand importeren"
        onComplete={() => setBezig(false)}
        steps={[
          "Bestand inlezen",
          "Kolommen herkennen",
          { label: "Dubbels opsporen", duration: 1800 },
          "Wegschrijven naar de database",
          "Rapport opmaken",
        ]}
      />

      {!bezig && (
        <MultiStepLoader
          loading
          step={2}
          title="Zo ziet stap 3 eruit"
          steps={["Bestand inlezen", "Kolommen herkennen", "Dubbels opsporen", "Wegschrijven", "Rapport"]}
        />
      )}
    </Stack>
  );
}
