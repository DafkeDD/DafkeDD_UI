"use client";
import {
  Carousel, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, CarouselTrack,
} from "@dafke/ui";

const KAARTEN = [
  { titel: "Voorste oogkamer", tekst: "OD — 12/03", kleur: "var(--accent-tint)" },
  { titel: "Fundus", tekst: "OD — 12/03", kleur: "var(--blue-tint)" },
  { titel: "OCT-scan", tekst: "OS — 12/03", kleur: "var(--green-tint)" },
  { titel: "Gezichtsveld", tekst: "OS — 14/03", kleur: "var(--amber-tint)" },
];

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 460 }}>
      <Carousel>
        <CarouselTrack>
          {KAARTEN.map((kaart) => (
            <CarouselItem key={kaart.titel} size="70%">
              <div
                style={{
                  height: 150, padding: 16, display: "flex", flexDirection: "column", justifyContent: "flex-end",
                  background: kaart.kleur, border: "1px solid var(--border)", borderRadius: "var(--r-md)",
                }}
              >
                <strong style={{ fontSize: 14 }}>{kaart.titel}</strong>
                <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{kaart.tekst}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselTrack>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <CarouselPrevious />
          <CarouselNext />
          <span style={{ flex: 1 }} />
          <CarouselDots style={{ margin: 0 }} />
        </div>
      </Carousel>
    </div>
  );
}
