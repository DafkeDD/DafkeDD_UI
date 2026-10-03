"use client";
import { useEffect, useRef, useState } from "react";
import { Avatar, Button, Icon, Stack, Text } from "@dafke/ui";
import { SwipeActions } from "@dafke/ui/motion";

interface Gesprek {
  id: string;
  naam: string;
  tekst: string;
  tijd: string;
  ongelezen?: boolean;
}

const START: Gesprek[] = [
  { id: "sc", naam: "Sarah Claes", tekst: "Designreview voor de nieuwe onboarding…", tijd: "9:41", ongelezen: true },
  { id: "mw", naam: "Mathias Wouters", tekst: "Re: Q3-planning — kunnen we morgen afstemmen?", tijd: "9:12", ongelezen: true },
  { id: "ar", naam: "Anke Reynaert", tekst: "Factuur #2481 van acme.be staat klaar", tijd: "gisteren" },
  { id: "po", naam: "Pieter Oosterlinck", tekst: "Het prototype waar je vorige week om vroeg", tijd: "ma" },
];

export default function Demo() {
  const [lijst, setLijst] = useState(START);
  const [laatste, setLaatste] = useState<{ gesprek: Gesprek; index: number; wat: string } | null>(null);
  const timer = useRef<number>(undefined);

  const weg = (gesprek: Gesprek, wat: string) => {
    setLaatste({ gesprek, index: lijst.findIndex((g) => g.id === gesprek.id), wat });
    setLijst((vorige) => vorige.filter((g) => g.id !== gesprek.id));
  };

  // Geen bevestigingsdialoog, maar een vangnet: vier seconden om het terug te draaien.
  useEffect(() => {
    if (!laatste) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLaatste(null), 4000);
    return () => window.clearTimeout(timer.current);
  }, [laatste]);

  const herstel = () => {
    if (!laatste) return;
    setLijst((vorige) => {
      const kopie = [...vorige];
      kopie.splice(laatste.index, 0, laatste.gesprek);
      return kopie;
    });
    setLaatste(null);
  };

  return (
    <Stack gap="md" style={{ width: "100%", maxWidth: 420 }}>
      <div
        style={{
          display: "grid", gap: 1, overflow: "hidden", background: "var(--border)",
          border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
        }}
      >
        {lijst.map((gesprek, index) => (
          <SwipeActions
            key={gesprek.id}
            hint={index === 0}
            style={{ borderRadius: 0 }}
            leading={[{ label: "Archief", icon: "archive", tone: "teal", onAction: () => weg(gesprek, "gearchiveerd") }]}
            trailing={[
              { label: "Archief", icon: "archive", tone: "teal", onAction: () => weg(gesprek, "gearchiveerd") },
              { label: "Verwijder", icon: "trash", tone: "red", onAction: () => weg(gesprek, "verwijderd") },
            ]}
          >
            <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px" }}>
              <Avatar name={gesprek.naam} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: gesprek.ongelezen ? 700 : 550, fontSize: 13.5 }}>
                    {gesprek.ongelezen && (
                      <span
                        style={{
                          display: "inline-block", width: 7, height: 7, borderRadius: 9, marginRight: 6,
                          background: "var(--accent)", verticalAlign: "middle",
                        }}
                      />
                    )}
                    {gesprek.naam}
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>{gesprek.tijd}</span>
                </div>
                <div
                  style={{
                    fontSize: 12.5, color: "var(--text-3)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}
                >
                  {gesprek.tekst}
                </div>
              </div>
            </div>
          </SwipeActions>
        ))}
        {lijst.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", background: "var(--surface)", color: "var(--text-3)", fontSize: 13 }}>
            Inbox leeg.{" "}
            <Button size="sm" variant="ghost" onClick={() => setLijst(START)}>
              Opnieuw vullen
            </Button>
          </div>
        )}
      </div>

      <div style={{ minHeight: 44 }}>
        {laatste && (
          <div
            key={laatste.gesprek.id + laatste.wat}
            role="status"
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 8px 14px",
              borderRadius: "var(--r-full)", background: "var(--text)", color: "var(--surface)",
              fontSize: 13, boxShadow: "var(--sh-lg)", animation: "lui-rise .3s var(--ease-pop) both",
            }}
          >
            <Icon name="check" size={14} />
            <span style={{ flex: 1 }}>Gesprek {laatste.wat}</span>
            <button
              type="button"
              onClick={herstel}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px",
                border: 0, borderRadius: "var(--r-full)", cursor: "pointer",
                background: "color-mix(in oklab, var(--surface) 18%, transparent)", color: "inherit",
                font: "inherit", fontWeight: 650,
              }}
            >
              <Icon name="undo" size={13} /> Ongedaan maken
            </button>
          </div>
        )}
      </div>

      <Text variant="small" tone="muted">
        Kort vegen toont de knoppen; voorbij de lijn vegen voert de actie meteen uit. Naar rechts is veilig
        (archiveren), naar links is de kostelijke kant (verwijderen). Geen bevestiging — wel ongedaan maken.
      </Text>
    </Stack>
  );
}
