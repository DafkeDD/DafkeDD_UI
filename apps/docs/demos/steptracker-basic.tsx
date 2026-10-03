"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Icon, StepTracker, type StepTrackerStep } from "@dafke/ui";

const STAPPEN: StepTrackerStep[] = [
  { id: "besteld", title: "Bestelling geplaatst", detail: "Bevestigd", time: "9:14", icon: <Icon name="file" /> },
  { id: "ingepakt", title: "Ingepakt", detail: "Magazijn Gent", time: "11:02", icon: <Icon name="box" /> },
  { id: "verzonden", title: "Verzonden", detail: "Hub Brussel verlaten", time: "18:40", icon: <Icon name="truck" /> },
  { id: "onderweg", title: "Onderweg naar jou", detail: "Koerier Jan W. · nog 4 stops", time: "13:15", icon: <Icon name="mapPin" /> },
  { id: "geleverd", title: "Geleverd", detail: "Aan de voordeur gelaten", time: "14:41", icon: <Icon name="home" /> },
];

type Fase = "klaar" | "bezig" | "probleem" | "geleverd";

export default function Demo() {
  const [huidig, setHuidig] = useState(-1);
  const [fase, setFase] = useState<Fase>("klaar");
  const timer = useRef<number>(undefined);

  // Elke 1,3 s schuift de levering een stap op; bij "onderweg" loopt het even mis.
  useEffect(() => {
    if (fase !== "bezig") return;
    timer.current = window.setTimeout(() => {
      const volgende = huidig + 1;
      if (volgende === 3 && huidig === 2) {
        setHuidig(3);
        setFase("probleem");
      } else if (volgende >= STAPPEN.length) {
        setHuidig(STAPPEN.length);
        setFase("geleverd");
      } else {
        setHuidig(volgende);
      }
    }, huidig === -1 ? 350 : 1300);
    return () => window.clearTimeout(timer.current);
  }, [fase, huidig]);

  // Het adresprobleem lost zichzelf op na een paar seconden, of meteen via de actie.
  useEffect(() => {
    if (fase !== "probleem") return;
    const t = window.setTimeout(() => setFase("bezig"), 3200);
    return () => window.clearTimeout(t);
  }, [fase]);

  const status =
    fase === "geleverd"
      ? { label: "Geleverd", tone: "green" as const }
      : fase === "probleem"
        ? { label: "Actie nodig", tone: "red" as const }
        : huidig >= 0
          ? { label: "Onderweg", tone: "accent" as const }
          : { label: "Geplaatst", tone: "neutral" as const };

  const voortgang = Math.max(0, Math.min(huidig, STAPPEN.length)) / STAPPEN.length;

  return (
    <div style={{ width: "100%", maxWidth: 520, resize: "horizontal", overflow: "auto", minWidth: 300, padding: 2 }}>
      <StepTracker
        icon={<Icon name="box" />}
        title="Bestelling #48213"
        subtitle="3 artikelen · levering do 2 okt"
        status={status}
        meta={fase === "geleverd" ? "Geleverd 14:41" : huidig >= 3 ? "Vandaag" : "Verwacht 2 okt"}
        steps={STAPPEN}
        current={huidig}
        error={
          fase === "probleem"
            ? {
                message: "Adres onvolledig — busnummer ontbreekt",
                action: { label: "Adres bevestigen", onClick: () => setFase("bezig") },
              }
            : null
        }
        footer={
          fase === "geleverd" ? (
            <>
              <Icon name="check" size={13} /> Geen handtekening nodig · foto als bewijs
            </>
          ) : null
        }
        action={
          fase === "geleverd" ? (
            <Button
              size="sm"
              icon={<Icon name="refresh" />}
              onClick={() => {
                setHuidig(-1);
                setFase("klaar");
              }}
            >
              Opnieuw
            </Button>
          ) : (
            <Button
              size="sm"
              icon={<Icon name="truck" />}
              onClick={() => fase === "klaar" && setFase("bezig")}
              style={{ position: "relative", overflow: "hidden" }}
            >
              {fase === "klaar" ? "Levering simuleren" : fase === "probleem" ? "In de wacht" : "Volgen…"}
              {fase !== "klaar" && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute", left: 10, right: 10, bottom: 5, height: 2, borderRadius: 2,
                    background: "rgb(255 255 255 / .25)", overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      display: "block", height: "100%", background: "#fff",
                      width: `${Math.max(voortgang, 0.06) * 100}%`, transition: "width .6s var(--ease-out)",
                    }}
                  />
                </span>
              )}
            </Button>
          )
        }
      />
    </div>
  );
}
