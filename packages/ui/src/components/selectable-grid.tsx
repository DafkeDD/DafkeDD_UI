"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Checkbox } from "./checkbox";
import { useControllableState } from "../lib/hooks";

export interface SelectableItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Kleurtoon van het icoonvlakje. */
  tone?: "accent" | "green" | "amber" | "red" | "blue" | "violet" | "neutral";
  disabled?: boolean;
}

export interface SelectableGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "onChange"> {
  items: SelectableItem[];
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Aangeklikt item openen in plaats van selecteren. */
  onOpen?: (item: SelectableItem) => void;
  /** Kolommen per breekpunt, bv. { 0: 2, 640: 3 }. */
  columns?: number | Record<number, number>;
  /** Balk met bulkacties onderaan zodra er iets geselecteerd is. */
  actions?: React.ReactNode;
  /** Label op de standaardknop in de balk. */
  actionLabel?: (count: number) => React.ReactNode;
  onAction?: (ids: string[]) => void;
  /** Tint van de actiebalk. */
  actionTone?: "accent" | "red" | "violet";
  /** Alles-selecteren-vinkje boven het raster. */
  showSelectAll?: boolean;
  selectAllLabel?: string;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  emptyIcon?: React.ReactNode;
}

/**
 * SelectableGrid — raster van kaarten die je aanvinkt, met een balk die
 * verschijnt zodra er iets geselecteerd is. De balk zweeft onder het raster en
 * verdwijnt weer zodra de selectie leeg is.
 */
export const SelectableGrid = React.forwardRef<HTMLDivElement, SelectableGridProps>(
  function SelectableGrid(
    {
      items,
      selected,
      defaultSelected,
      onSelectedChange,
      onOpen,
      columns = { 0: 2, 640: 3 },
      actions,
      actionLabel = (aantal) => `${aantal} item${aantal === 1 ? "" : "s"} verwijderen`,
      onAction,
      actionTone = "accent",
      showSelectAll,
      selectAllLabel = "Alles selecteren",
      emptyTitle = "Niets meer over",
      emptyDescription,
      emptyIcon,
      className,
      style,
      ...rest
    },
    ref
  ) {
    const [keuze, setKeuze] = useControllableState<string[]>({
      value: selected,
      defaultValue: defaultSelected ?? [],
      onChange: onSelectedChange,
    });

    const kiesbaar = items.filter((item) => !item.disabled).map((item) => item.id);
    const allesAan = kiesbaar.length > 0 && kiesbaar.every((id) => keuze.includes(id));
    const sommige = !allesAan && kiesbaar.some((id) => keuze.includes(id));

    const wissel = (id: string) =>
      setKeuze(keuze.includes(id) ? keuze.filter((item) => item !== id) : [...keuze, id]);

    /* Breekpunten naar een media-onafhankelijke grid-variabele. */
    const kolomStijl = React.useMemo<React.CSSProperties>(() => {
      if (typeof columns === "number") {
        return { ["--lui-selgrid-cols" as string]: columns };
      }
      const punten = Object.keys(columns).map(Number).sort((a, b) => a - b);
      return { ["--lui-selgrid-cols" as string]: columns[punten[0]] ?? 2 };
    }, [columns]);

    const breekpunten =
      typeof columns === "number"
        ? []
        : Object.entries(columns)
            .map(([punt, aantal]) => [Number(punt), aantal] as const)
            .filter(([punt]) => punt > 0)
            .sort((a, b) => a[0] - b[0]);

    const eigenId = React.useId().replace(/:/g, "");

    return (
      <div ref={ref} className={cn("lui-selgrid", className)} style={{ ...style, ...kolomStijl }} {...rest}>
        {breekpunten.length > 0 && (
          <style>
            {breekpunten
              .map(
                ([punt, aantal]) =>
                  `@media (min-width:${punt}px){[data-selgrid="${eigenId}"]{--lui-selgrid-cols:${aantal}}}`
              )
              .join("")}
          </style>
        )}

        {showSelectAll && items.length > 0 && (
          <div className="lui-selgrid-head">
            <Checkbox
              checked={allesAan}
              indeterminate={sommige}
              onChange={() => setKeuze(allesAan ? [] : kiesbaar)}
              label={selectAllLabel}
              size="sm"
            />
            {keuze.length > 0 && (
              <button type="button" className="lui-selgrid-deselect" onClick={() => setKeuze([])}>
                Selectie opheffen
              </button>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="lui-selgrid-empty">
            <span className="lui-selgrid-empty-icon">{emptyIcon ?? <Icon name="checkCircle" size={20} />}</span>
            <p className="lui-selgrid-empty-title">{emptyTitle}</p>
            {emptyDescription && <p className="lui-selgrid-empty-desc">{emptyDescription}</p>}
          </div>
        ) : (
          <div className="lui-selgrid-items" data-selgrid={eigenId}>
            {items.map((item) => {
              const aan = keuze.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="lui-selgrid-card"
                  data-selected={aan ? "" : undefined}
                  data-disabled={item.disabled ? "" : undefined}
                  data-tone={item.tone}
                >
                  <Checkbox
                    className="lui-selgrid-check"
                    checked={aan}
                    disabled={item.disabled}
                    onChange={() => wissel(item.id)}
                    aria-label={typeof item.title === "string" ? item.title : "Item selecteren"}
                  />
                  <button
                    type="button"
                    className="lui-selgrid-body"
                    disabled={item.disabled}
                    onClick={() => (onOpen ? onOpen(item) : wissel(item.id))}
                  >
                    <span className="lui-selgrid-icon">{item.icon ?? <Icon name="folder" size={18} />}</span>
                    <span className="lui-selgrid-title">{item.title}</span>
                    {item.description && <span className="lui-selgrid-desc">{item.description}</span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {keuze.length > 0 && (
          <div className="lui-selgrid-bar" data-tone={actionTone} role="region" aria-label="Bulkacties">
            {actions ?? (
              <button
                type="button"
                className="lui-selgrid-action"
                onClick={() => {
                  onAction?.(keuze);
                  setKeuze([]);
                }}
              >
                <Icon name="trash" size={15} />
                {actionLabel(keuze.length)}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
