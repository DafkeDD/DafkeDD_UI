"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Compactere rijen. */
  dense?: boolean;
  /** Wikkel de tabel in een kaart met rand en schaduw. */
  wrapped?: boolean;
  /** Minimale breedte voordat er horizontaal gescrold wordt. */
  minWidth?: number;
  /** Om de andere rij een lichte achtergrond. */
  striped?: boolean;
  /** Kop blijft staan bij het scrollen; geef maxHeight mee om te scrollen. */
  stickyHeader?: boolean;
  /** Maximale hoogte van de scrollcontainer, bv. 420. */
  maxHeight?: number;
}

/** Table — datatabel met sticky-vriendelijke kop en scrollcontainer. */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { dense, wrapped = true, minWidth = 560, striped, stickyHeader, maxHeight, className, children, ...rest },
  ref
) {
  const table = (
    <table
      ref={ref}
      className={cn(
        "lui-table",
        dense && "lui-table-dense",
        striped && "lui-table-striped",
        stickyHeader && "lui-table-sticky",
        className
      )}
      style={{ minWidth }}
      {...rest}
    >
      {children}
    </table>
  );

  const scroll = (
    <div className="lui-table-scroll" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
      {table}
    </div>
  );

  if (!wrapped) return scroll;
  return <div className="lui-table-wrap">{scroll}</div>;
});

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...rest }, ref) {
  return <thead ref={ref} className={cn("lui-table-header", className)} {...rest} />;
});

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...rest }, ref) {
  return <tbody ref={ref} className={cn("lui-table-body", className)} {...rest} />;
});

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...rest }, ref) {
  return <tfoot ref={ref} className={cn("lui-table-footer", className)} {...rest} />;
});

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Rij reageert op klikken. */
  clickable?: boolean;
  selected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { clickable, selected, className, ...rest },
  ref
) {
  return (
    <tr
      ref={ref}
      data-selected={selected ? "" : undefined}
      className={cn("lui-table-row", clickable && "lui-table-row-clickable", className)}
      {...rest}
    />
  );
});

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Maakt de kolomkop klikbaar om te sorteren. */
  sortable?: boolean;
  sorted?: "asc" | "desc" | false;
  align?: "left" | "center" | "right";
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { sortable, sorted, align = "left", className, children, onClick, ...rest },
  ref
) {
  return (
    <th
      ref={ref}
      scope="col"
      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
      className={cn("lui-table-head", `lui-align-${align}`, sortable && "lui-table-head-sortable", className)}
      onClick={sortable ? onClick : undefined}
      {...rest}
    >
      <span className="lui-table-head-inner">
        {children}
        {sortable && (
          <Icon
            name={sorted === "asc" ? "chevronUp" : sorted === "desc" ? "chevronDown" : "chevronsUpDown"}
            size={13}
            className={cn("lui-table-sort", sorted && "lui-table-sort-active")}
          />
        )}
      </span>
    </th>
  );
});

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  /** Nadrukkelijke tekstkleur (voor de eerste kolom). */
  strong?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align = "left", strong, className, ...rest },
  ref
) {
  return (
    <td
      ref={ref}
      className={cn("lui-table-cell", `lui-align-${align}`, strong && "lui-table-cell-strong", className)}
      {...rest}
    />
  );
});

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...rest }, ref) {
  return <caption ref={ref} className={cn("lui-table-caption", className)} {...rest} />;
});

/** Toolbar boven een tabel (zoekveld, filters, knoppen). */
export const TableToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TableToolbar({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-table-toolbar", className)} {...rest} />;
  }
);
