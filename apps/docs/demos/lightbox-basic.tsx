"use client";
import { useState } from "react";
import { Lightbox, Text } from "@dafke/ui";

/** Zelfgetekende afbeeldingen, zodat de demo geen externe bestanden nodig heeft. */
function tekening(van: string, naar: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${van}"/><stop offset="1" stop-color="${naar}"/>
    </linearGradient></defs>
    <rect width="960" height="600" fill="url(#g)"/>
    <circle cx="250" cy="430" r="150" fill="rgba(255,255,255,.14)"/>
    <circle cx="720" cy="180" r="220" fill="rgba(255,255,255,.1)"/>
    <text x="48" y="96" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="rgba(255,255,255,.92)">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const AFBEELDINGEN = [
  { src: tekening("#0f766e", "#14b8a6", "Kust"), alt: "Kust", caption: "Oostduinkerke, september" },
  { src: tekening("#4338ca", "#818cf8", "Stad"), alt: "Stad", caption: "Antwerpen bij valavond" },
  { src: tekening("#b45309", "#fbbf24", "Bos"), alt: "Bos", caption: "Zoniënwoud in de herfst" },
  { src: tekening("#9d174d", "#f472b6", "Markt"), alt: "Markt", caption: "Zaterdagmarkt" },
];

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div>
      <Text variant="small" tone="muted" style={{ marginBottom: 10 }}>
        Klik een afbeelding aan. Pijltjes bladeren, dubbelklikken zoomt, Escape sluit.
      </Text>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {AFBEELDINGEN.map((afbeelding, i) => (
          <button
            key={afbeelding.alt}
            type="button"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            style={{
              padding: 0,
              border: "1px solid var(--border)",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "zoom-in",
              background: "none",
              aspectRatio: "16 / 10",
            }}
            aria-label={`${afbeelding.alt} openen`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={afbeelding.src}
              alt={afbeelding.alt}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </button>
        ))}
      </div>

      <Lightbox
        items={AFBEELDINGEN}
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
      />
    </div>
  );
}
