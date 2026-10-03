"use client";
import { useRef } from "react";
import { Card, InView, ScrollProgress, Text } from "@dafke/ui";

const BLOKKEN = [
  { titel: "Omhoog", animation: "up" as const },
  { titel: "Van links", animation: "right" as const },
  { titel: "Schalen", animation: "scale" as const },
  { titel: "Vervagen", animation: "fade" as const },
  { titel: "Van rechts", animation: "left" as const },
  { titel: "Omlaag", animation: "down" as const },
];

export default function Demo() {
  const scroller = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <ScrollProgress target={scroller} showValue />
      <div
        ref={scroller}
        style={{
          height: 300,
          overflowY: "auto",
          padding: "12px 14px 160px",
          border: "1px solid var(--border)",
          borderRadius: 10,
          display: "grid",
          gap: 14,
        }}
      >
        <Text variant="small" tone="muted">
          Scroll dit paneel: elk blok komt binnen zodra het in beeld staat, en
          het balkje erboven volgt hoe ver je bent.
        </Text>
        {BLOKKEN.map((blok, index) => (
          <InView
            key={blok.titel}
            animation={blok.animation}
            delay={index * 40}
            amount={0.4}
            once={false}
          >
            <Card style={{ padding: 16 }}>
              <Text weight="semibold">{blok.titel}</Text>
              <Text variant="small" tone="muted">
                animation=&quot;{blok.animation}&quot;
              </Text>
            </Card>
          </InView>
        ))}
      </div>
    </div>
  );
}
