"use client";
import { useState } from "react";
import { Card, CardContent, Chip, ChipGroup, Composer, Icon, TaskItem, TaskList } from "@dafke/ui";

type Taak = {
  id: number;
  titel: string;
  klaar: boolean;
  prioriteit: "none" | "low" | "normal" | "high";
  lijst: { naam: string; kleur: string };
  deadline?: string;
  herhaalt?: boolean;
  deeltaken?: { done: number; total: number };
};

const LIJSTEN = [
  { naam: "Werk", kleur: "var(--accent)" },
  { naam: "Privé", kleur: "var(--violet)" },
  { naam: "Boodschappen", kleur: "var(--green)" },
];

const START: Taak[] = [
  {
    id: 1,
    titel: "Offerte nakijken voor de nieuwe praktijkruimte",
    klaar: false,
    prioriteit: "high",
    lijst: LIJSTEN[0],
    deadline: "Vandaag 17:00",
    deeltaken: { done: 2, total: 5 },
  },
  {
    id: 2,
    titel: "Wekelijkse planning doorsturen naar het team",
    klaar: false,
    prioriteit: "normal",
    lijst: LIJSTEN[0],
    herhaalt: true,
  },
  {
    id: 3,
    titel: "Brillenglazen ophalen bij de leverancier",
    klaar: false,
    prioriteit: "low",
    lijst: LIJSTEN[2],
    deadline: "Morgen",
  },
  { id: 4, titel: "Fietsband plakken", klaar: true, prioriteit: "none", lijst: LIJSTEN[1] },
];

export default function Demo() {
  const [taken, setTaken] = useState(START);
  const [lijst, setLijst] = useState("Werk");
  const [volgend, setVolgend] = useState(5);

  const zichtbaar = taken.filter((taak) => taak.lijst.naam === lijst);
  const open = zichtbaar.filter((taak) => !taak.klaar).length;

  const toevoegen = (tekst: string) => {
    const doel = LIJSTEN.find((l) => l.naam === lijst) ?? LIJSTEN[0];
    setTaken((vorige) => [
      { id: volgend, titel: tekst, klaar: false, prioriteit: "none", lijst: doel },
      ...vorige,
    ]);
    setVolgend((n) => n + 1);
  };

  return (
    <Card>
      <CardContent style={{ display: "grid", gap: 16 }}>
        <ChipGroup>
          {LIJSTEN.map((l) => (
            <Chip key={l.naam} selected={lijst === l.naam} onClick={() => setLijst(l.naam)}>
              <span
                style={{ width: 8, height: 8, borderRadius: 999, background: l.kleur, display: "inline-block" }}
              />
              {l.naam}
            </Chip>
          ))}
        </ChipGroup>

        <Composer
          onSubmit={toevoegen}
          placeholder={`Iets toevoegen aan ${lijst}…`}
          voice={false}
        />

        <TaskList bordered>
          {zichtbaar.map((taak) => (
            <TaskItem
              key={taak.id}
              title={taak.titel}
              done={taak.klaar}
              priority={taak.prioriteit}
              progress={taak.deeltaken}
              tags={[
                { label: taak.lijst.naam, dot: taak.lijst.kleur },
                ...(taak.deadline
                  ? [
                      {
                        icon: <Icon name="calendar" />,
                        label: taak.deadline,
                        tone: taak.deadline.startsWith("Vandaag") ? ("red" as const) : ("neutral" as const),
                      },
                    ]
                  : []),
                ...(taak.herhaalt ? [{ icon: <Icon name="repeat" />, label: "Wekelijks" }] : []),
              ]}
              onToggle={(klaar) =>
                setTaken((vorige) => vorige.map((t) => (t.id === taak.id ? { ...t, klaar } : t)))
              }
              onDelete={() => setTaken((vorige) => vorige.filter((t) => t.id !== taak.id))}
            />
          ))}
        </TaskList>

        <div style={{ fontSize: 13, color: "var(--text-3)" }}>
          {open === 0 ? "Alles afgewerkt in deze lijst 🎉" : `${open} open ${open === 1 ? "taak" : "taken"}`}
        </div>
      </CardContent>
    </Card>
  );
}
