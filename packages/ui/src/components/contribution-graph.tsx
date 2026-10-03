"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface ContributionDay {
  /** Datum als "jjjj-mm-dd" of een Date. */
  date: string | Date;
  value: number;
}

export interface ContributionGraphProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: ContributionDay[];
  /** Laatste dag in beeld; standaard vandaag. */
  until?: Date;
  /** Aantal weken dat getoond wordt. */
  weeks?: number;
  /** Grenswaarden voor de vier kleurstappen; standaard afgeleid uit de data. */
  thresholds?: [number, number, number];
  /** Eerste dag van de week; 1 = maandag. */
  weekStartsOn?: 0 | 1;
  showMonths?: boolean;
  showWeekdays?: boolean;
  showLegend?: boolean;
  /** Eigen tekst in de tooltip. */
  formatTooltip?: (day: ContributionDay, iso: string) => React.ReactNode;
  onSelect?: (day: ContributionDay, iso: string) => void;
  color?: string;
  locale?: string;
}

const DAG_MS = 86400000;

const naarIso = (datum: Date) =>
  `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, "0")}-${String(datum.getDate()).padStart(2, "0")}`;

const naarDatum = (waarde: string | Date) => (waarde instanceof Date ? waarde : new Date(`${waarde}T00:00:00`));

/**
 * ContributionGraph — kalenderraster met één vakje per dag, donkerder naarmate
 * de waarde hoger ligt. Kolommen zijn weken, rijen de dagen van de week.
 */
export const ContributionGraph = React.forwardRef<HTMLDivElement, ContributionGraphProps>(
  function ContributionGraph(
    {
      data,
      until,
      weeks = 53,
      thresholds,
      weekStartsOn = 1,
      showMonths = true,
      showWeekdays = true,
      showLegend = true,
      formatTooltip,
      onSelect,
      color = "var(--accent)",
      locale = "nl-BE",
      className,
      ...rest
    },
    ref
  ) {
    const [actief, setActief] = React.useState<string | null>(null);

    const perDag = React.useMemo(() => {
      const kaart = new Map<string, number>();
      for (const dag of data) {
        const iso = naarIso(naarDatum(dag.date));
        kaart.set(iso, (kaart.get(iso) ?? 0) + dag.value);
      }
      return kaart;
    }, [data]);

    /* Het raster loopt tot het einde van de week waarin `until` valt. */
    const kolommen = React.useMemo(() => {
      const eind = until ? new Date(until) : new Date();
      eind.setHours(0, 0, 0, 0);
      const verschuiving = (eind.getDay() - weekStartsOn + 7) % 7;
      const laatsteWeekStart = new Date(eind.getTime() - verschuiving * DAG_MS);
      const start = new Date(laatsteWeekStart.getTime() - (weeks - 1) * 7 * DAG_MS);

      const resultaat: Array<Array<{ datum: Date; iso: string; waarde: number | null }>> = [];
      for (let w = 0; w < weeks; w += 1) {
        const week: Array<{ datum: Date; iso: string; waarde: number | null }> = [];
        for (let d = 0; d < 7; d += 1) {
          const datum = new Date(start.getTime() + (w * 7 + d) * DAG_MS);
          const iso = naarIso(datum);
          week.push({ datum, iso, waarde: datum > eind ? null : perDag.get(iso) ?? 0 });
        }
        resultaat.push(week);
      }
      return resultaat;
    }, [until, weeks, weekStartsOn, perDag]);

    const grenzen = React.useMemo<[number, number, number]>(() => {
      if (thresholds) return thresholds;
      const waarden = [...perDag.values()].filter((waarde) => waarde > 0).sort((a, b) => a - b);
      if (waarden.length === 0) return [1, 2, 3];
      const kwantiel = (deel: number) => waarden[Math.min(waarden.length - 1, Math.floor(waarden.length * deel))];
      return [Math.max(kwantiel(0.25), 1), Math.max(kwantiel(0.5), 2), Math.max(kwantiel(0.75), 3)];
    }, [perDag, thresholds]);

    const niveau = (waarde: number) => {
      if (waarde <= 0) return 0;
      if (waarde < grenzen[0]) return 1;
      if (waarde < grenzen[1]) return 2;
      if (waarde < grenzen[2]) return 3;
      return 4;
    };

    const maandNamen = React.useMemo(() => {
      const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
      const labels: Array<{ index: number; naam: string }> = [];
      let vorige = -1;
      kolommen.forEach((week, index) => {
        const maand = week[0].datum.getMonth();
        if (maand !== vorige) {
          vorige = maand;
          labels.push({ index, naam: formatter.format(week[0].datum) });
        }
      });
      return labels;
    }, [kolommen, locale]);

    const weekdagen = React.useMemo(() => {
      const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
      /* 1 januari 2024 was een maandag; van daaruit tellen we de rij door. */
      return Array.from({ length: 7 }, (_, index) => {
        const datum = new Date(2024, 0, 1 + ((weekStartsOn + index + 6) % 7));
        return formatter.format(datum);
      });
    }, [locale, weekStartsOn]);

    const datumTekst = React.useMemo(
      () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }),
      [locale]
    );

    return (
      <div
        ref={ref}
        className={cn("lui-contrib", className)}
        style={{ ["--lui-contrib-color" as string]: color }}
        {...rest}
      >
        <div className="lui-contrib-body">
          {showWeekdays && (
            <div className="lui-contrib-days">
              {weekdagen.map((dag, index) => (
                <span key={dag} className="lui-contrib-day">
                  {index % 2 === 0 ? dag : ""}
                </span>
              ))}
            </div>
          )}

          <div className="lui-contrib-scroll">
            {showMonths && (
              <div className="lui-contrib-months">
                {maandNamen.map((maand) => (
                  <span
                    key={`${maand.naam}-${maand.index}`}
                    className="lui-contrib-month"
                    style={{ gridColumnStart: maand.index + 1 }}
                  >
                    {maand.naam}
                  </span>
                ))}
              </div>
            )}

            <div className="lui-contrib-grid">
              {kolommen.map((week, index) => (
                <div className="lui-contrib-week" key={index} style={{ "--w": index } as React.CSSProperties}>
                  {week.map((dag) =>
                    dag.waarde === null ? (
                      <span key={dag.iso} className="lui-contrib-cell" data-empty="" />
                    ) : (
                      <span
                        key={dag.iso}
                        className="lui-contrib-cell"
                        data-level={niveau(dag.waarde)}
                        tabIndex={onSelect ? 0 : undefined}
                        role={onSelect ? "button" : undefined}
                        onPointerEnter={() => setActief(dag.iso)}
                        onPointerLeave={() => setActief((huidig) => (huidig === dag.iso ? null : huidig))}
                        onFocus={() => setActief(dag.iso)}
                        onBlur={() => setActief((huidig) => (huidig === dag.iso ? null : huidig))}
                        onClick={
                          onSelect ? () => onSelect({ date: dag.iso, value: dag.waarde ?? 0 }, dag.iso) : undefined
                        }
                      >
                        {actief === dag.iso && (
                          <span className="lui-contrib-tip" role="tooltip">
                            {formatTooltip
                              ? formatTooltip({ date: dag.iso, value: dag.waarde }, dag.iso)
                              : `${dag.waarde} op ${datumTekst.format(dag.datum)}`}
                          </span>
                        )}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showLegend && (
          <div className="lui-contrib-legend">
            <span>Minder</span>
            {[0, 1, 2, 3, 4].map((stap) => (
              <span key={stap} className="lui-contrib-cell" data-level={stap} />
            ))}
            <span>Meer</span>
          </div>
        )}
      </div>
    );
  }
);
