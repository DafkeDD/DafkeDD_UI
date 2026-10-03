"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, slotChildren } from "../lib/slot";

export interface RowListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rand en schaduw rond de hele lijst. */
  bordered?: boolean;
  /** Losse rijen met ruimte ertussen in plaats van scheidingslijnen. */
  separated?: boolean;
  dense?: boolean;
}

/** RowList — container voor ListRow's, met scheidingslijnen of als losse kaartjes. */
export const RowList = React.forwardRef<HTMLDivElement, RowListProps>(function RowList(
  { bordered, separated, dense, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "lui-rowlist",
        bordered && "lui-rowlist-bordered",
        separated && "lui-rowlist-separated",
        dense && "lui-rowlist-dense",
        className
      )}
      {...rest}
    />
  );
});

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Avatar, icoontegel of vinkje links. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Vaste kolom vóór de titel, bv. een tijdstip. */
  lead?: React.ReactNode;
  /** Badges of tekst rechts van de titel. */
  trailing?: React.ReactNode;
  /** Knoppen helemaal rechts. */
  actions?: React.ReactNode;
  clickable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /** Rendert je eigen element (link, button) met behoud van stijl. */
  asChild?: boolean;
  /** Gekleurd streepje links, bv. per type of status. */
  accent?: string;
}

/**
 * ListRow — één rij in een lijst: afspraak, document, gebruiker of melding.
 * Alles behalve de titel is optioneel, dus dezelfde rij past in elk scherm.
 */
export const ListRow = React.forwardRef<HTMLDivElement, ListRowProps>(function ListRow(
  {
    leading,
    title,
    subtitle,
    lead,
    trailing,
    actions,
    clickable,
    selected,
    disabled,
    asChild,
    accent,
    className,
    children,
    style,
    ...rest
  },
  ref
) {
  const Comp = (asChild ? Slot : "div") as React.ElementType;
  const slot = slotChildren(asChild, children);

  return (
    <Comp
      ref={ref}
      data-selected={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      tabIndex={clickable && !asChild ? 0 : undefined}
      role={clickable && !asChild ? "button" : undefined}
      className={cn("lui-row", clickable && "lui-row-clickable", className)}
      style={{ ...(accent ? ({ ["--lui-row-accent" as string]: accent } as React.CSSProperties) : {}), ...style }}
      {...rest}
    >
      {slot.wrap(
        <>
      {accent && <span className="lui-row-accent" aria-hidden="true" />}
      {lead && <div className="lui-row-lead">{lead}</div>}
      {leading && <div className="lui-row-leading">{leading}</div>}

      <div className="lui-row-body">
        <div className="lui-row-title">{title}</div>
        {subtitle && <div className="lui-row-subtitle">{subtitle}</div>}
        {slot.inner}
      </div>

      {trailing && <div className="lui-row-trailing">{trailing}</div>}
      {actions && <div className="lui-row-actions">{actions}</div>}
        </>
      )}
    </Comp>
  );
});

export interface RowIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "accent" | "green" | "amber" | "red" | "blue" | "violet" | "neutral";
  size?: number;
  square?: boolean;
}

/** RowIcon — getinte icoontegel voor in de `leading` van een rij. */
export const RowIcon = React.forwardRef<HTMLSpanElement, RowIconProps>(function RowIcon(
  { tone = "neutral", size = 36, square, className, style, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn("lui-row-icon", `lui-row-icon-${tone}`, className)}
      style={{ width: size, height: size, borderRadius: square ? "var(--r-sm)" : undefined, ...style }}
      {...rest}
    />
  );
});
