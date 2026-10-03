"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

export interface KanbanCard {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Kleurstreep links op de kaart. */
  tone?: "accent" | "green" | "amber" | "red" | "blue" | "violet";
  /** Extra inhoud onderaan de kaart, bv. avatars of een badge. */
  footer?: React.ReactNode;
  disabled?: boolean;
}

export interface KanbanColumn {
  id: string;
  title: React.ReactNode;
  /** Tekst rechts van de titel; standaard het aantal kaarten. */
  badge?: React.ReactNode;
  /** Kaarten weigeren in deze kolom. */
  locked?: boolean;
  /** Waarschuwt zodra er meer kaarten in staan. */
  limit?: number;
  emptyLabel?: React.ReactNode;
}

export interface KanbanMove {
  cardId: string;
  from: string;
  to: string;
  /** Plaats binnen de doelkolom. */
  index: number;
}

export interface KanbanProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  columns: KanbanColumn[];
  /** Kaarten per kolom-id. */
  cards?: Record<string, KanbanCard[]>;
  defaultCards?: Record<string, KanbanCard[]>;
  onCardsChange?: (cards: Record<string, KanbanCard[]>) => void;
  /** Wordt aangeroepen bij elke verplaatsing, ook bij controlled gebruik. */
  onMove?: (move: KanbanMove) => void;
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  /** Eigen weergave van een kaart. */
  renderCard?: (card: KanbanCard, columnId: string) => React.ReactNode;
  /** Inhoud onderaan een kolom, bv. een "kaart toevoegen"-knop. */
  columnFooter?: (column: KanbanColumn) => React.ReactNode;
  /** Vaste kolombreedte; zonder dit verdelen de kolommen de ruimte. */
  columnWidth?: number;
  /** Slepen uitzetten en het bord alleen tonen. */
  readOnly?: boolean;
}

interface SleepStand {
  cardId: string;
  from: string;
}

/**
 * Kanban — kolommen met kaarten die je met de muis of het toetsenbord
 * verplaatst. Zonder `cards` beheert het bord zijn eigen indeling.
 */
export const Kanban = React.forwardRef<HTMLDivElement, KanbanProps>(function Kanban(
  {
    columns,
    cards,
    defaultCards,
    onCardsChange,
    onMove,
    onCardClick,
    renderCard,
    columnFooter,
    columnWidth,
    readOnly,
    className,
    ...rest
  },
  ref
) {
  const [bord, setBord] = useControllableState<Record<string, KanbanCard[]>>({
    value: cards,
    defaultValue: defaultCards ?? {},
    onChange: onCardsChange,
  });

  const [sleep, setSleep] = React.useState<SleepStand | null>(null);
  const [doel, setDoel] = React.useState<{ column: string; index: number } | null>(null);

  const verplaats = React.useCallback(
    (cardId: string, van: string, naar: string, index: number) => {
      setBord((vorige) => {
        const bronLijst = [...(vorige[van] ?? [])];
        const positie = bronLijst.findIndex((kaart) => kaart.id === cardId);
        if (positie === -1) return vorige;
        const [kaart] = bronLijst.splice(positie, 1);

        /* Binnen dezelfde kolom is de lijst al één korter, dus de doelindex
           schuift mee wanneer de kaart van boven kwam. */
        const doelLijst = van === naar ? bronLijst : [...(vorige[naar] ?? [])];
        const gecorrigeerd = van === naar && positie < index ? index - 1 : index;
        doelLijst.splice(Math.min(Math.max(gecorrigeerd, 0), doelLijst.length), 0, kaart);

        return van === naar
          ? { ...vorige, [naar]: doelLijst }
          : { ...vorige, [van]: bronLijst, [naar]: doelLijst };
      });
      onMove?.({ cardId, from: van, to: naar, index });
    },
    [onMove, setBord]
  );

  /* Toetsenbord: pijltjes links en rechts verhuizen de kaart naar de buurkolom. */
  const opKaartToets = (event: React.KeyboardEvent, kaart: KanbanCard, kolomId: string) => {
    if (readOnly || kaart.disabled) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const huidig = columns.findIndex((kolom) => kolom.id === kolomId);
    const richting = event.key === "ArrowRight" ? 1 : -1;
    const volgende = columns[huidig + richting];
    if (!volgende || volgende.locked) return;
    event.preventDefault();
    verplaats(kaart.id, kolomId, volgende.id, (bord[volgende.id] ?? []).length);
  };

  const kaartInhoud = (kaart: KanbanCard, kolomId: string) =>
    renderCard?.(kaart, kolomId) ?? (
      <>
        <span className="lui-kanban-card-title">{kaart.title}</span>
        {kaart.description && <span className="lui-kanban-card-desc">{kaart.description}</span>}
        {kaart.footer && <span className="lui-kanban-card-foot">{kaart.footer}</span>}
      </>
    );

  return (
    <div ref={ref} className={cn("lui-kanban", className)} {...rest}>
      {columns.map((kolom) => {
        const lijst = bord[kolom.id] ?? [];
        const teVol = kolom.limit !== undefined && lijst.length > kolom.limit;
        const actief = doel?.column === kolom.id;

        return (
          <section
            key={kolom.id}
            className="lui-kanban-column"
            style={columnWidth ? { flex: "none", width: columnWidth } : undefined}
            data-over={actief && !kolom.locked ? "" : undefined}
            data-locked={kolom.locked ? "" : undefined}
            onDragOver={(event) => {
              if (readOnly || kolom.locked || !sleep) return;
              event.preventDefault();
              if (!actief) setDoel({ column: kolom.id, index: lijst.length });
            }}
            onDrop={(event) => {
              if (readOnly || kolom.locked || !sleep) return;
              event.preventDefault();
              verplaats(sleep.cardId, sleep.from, kolom.id, doel?.index ?? lijst.length);
              setSleep(null);
              setDoel(null);
            }}
          >
            <header className="lui-kanban-head">
              <span className="lui-kanban-title">{kolom.title}</span>
              <span className="lui-kanban-badge" data-over-limit={teVol ? "" : undefined}>
                {kolom.badge ?? (kolom.limit !== undefined ? `${lijst.length}/${kolom.limit}` : lijst.length)}
              </span>
            </header>

            <div className="lui-kanban-list">
              {lijst.map((kaart, index) => (
                <React.Fragment key={kaart.id}>
                  {actief && doel?.index === index && <span className="lui-kanban-drop" aria-hidden="true" />}
                  <article
                    className="lui-kanban-card"
                    data-tone={kaart.tone}
                    data-dragging={sleep?.cardId === kaart.id ? "" : undefined}
                    draggable={!readOnly && !kaart.disabled}
                    tabIndex={kaart.disabled ? -1 : 0}
                    aria-disabled={kaart.disabled || undefined}
                    onDragStart={() => setSleep({ cardId: kaart.id, from: kolom.id })}
                    onDragEnd={() => {
                      setSleep(null);
                      setDoel(null);
                    }}
                    onDragOver={(event) => {
                      if (readOnly || kolom.locked || !sleep) return;
                      event.preventDefault();
                      event.stopPropagation();
                      const rect = event.currentTarget.getBoundingClientRect();
                      const onderHelft = event.clientY > rect.top + rect.height / 2;
                      setDoel({ column: kolom.id, index: index + (onderHelft ? 1 : 0) });
                    }}
                    onClick={() => onCardClick?.(kaart, kolom.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && onCardClick) {
                        event.preventDefault();
                        onCardClick(kaart, kolom.id);
                      }
                      opKaartToets(event, kaart, kolom.id);
                    }}
                  >
                    {kaartInhoud(kaart, kolom.id)}
                  </article>
                </React.Fragment>
              ))}

              {actief && (doel?.index ?? 0) >= lijst.length && (
                <span className="lui-kanban-drop" aria-hidden="true" />
              )}

              {lijst.length === 0 && !actief && (
                <p className="lui-kanban-empty">{kolom.emptyLabel ?? "Leeg"}</p>
              )}
            </div>

            {columnFooter && <footer className="lui-kanban-foot">{columnFooter(kolom)}</footer>}
          </section>
        );
      })}
    </div>
  );
});
