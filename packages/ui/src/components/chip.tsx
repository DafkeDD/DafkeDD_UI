"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Gekozen staat, bv. een actief filter. */
  selected?: boolean;
  icon?: React.ReactNode;
  /** Toont een kruisje; wordt aangeroepen bij klikken erop. */
  onRemove?: () => void;
  size?: "sm" | "md";
  /** Telling rechts in de chip. */
  count?: React.ReactNode;
}

/** Chip — klikbaar filterlabel; met `onRemove` wordt het een verwijderbare tag. */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected, icon, onRemove, size = "md", count, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      data-selected={selected ? "" : undefined}
      className={cn("lui-chip", `lui-chip-${size}`, className)}
      {...rest}
    >
      {icon && <span className="lui-chip-icon">{icon}</span>}
      {children}
      {count != null && <span className="lui-chip-count">{count}</span>}
      {onRemove && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Verwijderen"
          className="lui-chip-remove"
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <Icon name="x" size={12} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
});

export interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Laat de chips op één regel scrollen in plaats van afbreken. */
  scrollable?: boolean;
}

/** ChipGroup — rij chips, bv. een filterbalk boven een lijst. */
export const ChipGroup = React.forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup(
  { scrollable, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-chip-group", scrollable && "lui-chip-group-scroll", className)}
      {...rest}
    />
  );
});
