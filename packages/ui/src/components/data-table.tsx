"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Checkbox } from "./checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";
import { EmptyState } from "./empty-state";
import { Input } from "./input";
import { Pagination } from "./pagination";
import { Skeleton } from "./skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export type SortDirection = "asc" | "desc";

export interface DataTableSort {
  /** Sleutel van de kolom waarop gesorteerd wordt. */
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Unieke sleutel; ook de standaardbron van de waarde als er geen accessor is. */
  key: string;
  header: React.ReactNode;
  /** Haalt de waarde op waarop gesorteerd en gezocht wordt. */
  accessor?: (row: T) => unknown;
  /** Eigen weergave van de cel; zonder dit wordt de waarde als tekst getoond. */
  cell?: (row: T, index: number) => React.ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  /** Vaste breedte of minimumbreedte, bv. 120 of "18%". */
  width?: number | string;
  /** Kolom verbergen onder de smalle grens. */
  hideBelow?: number;
  /** Nadrukkelijke tekst, bedoeld voor de eerste kolom. */
  strong?: boolean;
}

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  /** Stabiele sleutel per rij; zonder dit wordt de index gebruikt. */
  rowKey?: (row: T, index: number) => string;

  /** Zoekveld boven de tabel dat over alle kolommen zoekt. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Zoekterm zelf beheren (bv. om op de server te zoeken). */
  search?: string;
  onSearchChange?: (value: string) => void;

  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Sorteren en filteren gebeurt buiten het component (server-side). */
  manual?: boolean;

  /** Selectievakjes per rij. */
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (keys: string[]) => void;

  page?: number;
  defaultPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  /** Totaal aantal rijen bij server-side paginering. */
  total?: number;

  onRowClick?: (row: T, index: number) => void;
  /** Extra inhoud links boven de tabel, bv. filters of een knop. */
  toolbar?: React.ReactNode;
  /** Inhoud rechts boven de tabel; verschijnt bij een selectie. */
  selectionActions?: React.ReactNode;
  /** Knoppen helemaal rechts in de balk, bv. Filter en Toevoegen. */
  actions?: React.ReactNode;
  /**
   * Menu-items per rij achter een ⋯-knop in een laatste kolom. Geef
   * DropdownMenuItem-elementen terug.
   */
  rowActions?: (row: T, index: number) => React.ReactNode;
  /** Label van de actiekolom. */
  rowActionsLabel?: React.ReactNode;
  /** "accent" kleurt de kopregel in de accentkleur met witte tekst. */
  headerTone?: "default" | "accent";
  /** Rij licht op bij hover, met een accentstreepje links. */
  hoverable?: boolean;

  loading?: boolean;
  loadingRows?: number;
  emptyTitle?: React.ReactNode;
  emptyDescription?: React.ReactNode;
  dense?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  maxHeight?: number;
  minWidth?: number;
  /** Tekst onder de tabel; standaard "x van y rijen". */
  summary?: (zichtbaar: number, totaal: number) => React.ReactNode;
}

const tekstVan = (waarde: unknown): string => {
  if (waarde === null || waarde === undefined) return "";
  if (waarde instanceof Date) return waarde.toISOString();
  return String(waarde);
};

function vergelijk(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return tekstVan(a).localeCompare(tekstVan(b), "nl-BE", { numeric: true, sensitivity: "base" });
}

/**
 * DataTable — tabel met sorteren, zoeken, selecteren en paginering in één
 * component. Alles werkt uncontrolled zolang je niets meegeeft; geef `manual`
 * mee wanneer de server het werk doet en jij alleen de bladzijde toont.
 */
export function DataTable<T>({
  data,
  columns,
  rowKey,
  searchable,
  searchPlaceholder = "Zoeken…",
  search,
  onSearchChange,
  sort,
  defaultSort = null,
  onSortChange,
  manual,
  selectable,
  selected,
  defaultSelected,
  onSelectedChange,
  page,
  defaultPage = 1,
  pageSize,
  onPageChange,
  total,
  onRowClick,
  toolbar,
  selectionActions,
  actions,
  rowActions,
  rowActionsLabel = "Acties",
  headerTone = "default",
  hoverable = true,
  loading,
  loadingRows = 5,
  emptyTitle = "Niets gevonden",
  emptyDescription,
  dense,
  striped,
  stickyHeader,
  maxHeight,
  minWidth = 560,
  summary,
  className,
  ...rest
}: DataTableProps<T>) {
  const [interneZoek, setInterneZoek] = React.useState("");
  const zoek = search ?? interneZoek;
  const zetZoek = (waarde: string) => {
    if (search === undefined) setInterneZoek(waarde);
    onSearchChange?.(waarde);
  };

  const [interneSort, setInterneSort] = React.useState<DataTableSort | null>(defaultSort);
  const huidigeSort = sort !== undefined ? sort : interneSort;

  const [internePagina, setInternePagina] = React.useState(defaultPage);
  const huidigePagina = page ?? internePagina;

  const [interneSelectie, setInterneSelectie] = React.useState<string[]>(defaultSelected ?? []);
  const selectie = selected ?? interneSelectie;
  const zetSelectie = (volgende: string[]) => {
    if (selected === undefined) setInterneSelectie(volgende);
    onSelectedChange?.(volgende);
  };

  const sleutel = React.useCallback(
    (rij: T, index: number) => rowKey?.(rij, index) ?? String(index),
    [rowKey]
  );

  const waardeVan = React.useCallback(
    (rij: T, kolom: DataTableColumn<T>) =>
      kolom.accessor ? kolom.accessor(rij) : (rij as Record<string, unknown>)[kolom.key],
    []
  );

  /* Zoeken en sorteren slaan we over zodra manual aanstaat: dan is de data al klaar. */
  const gefilterd = React.useMemo(() => {
    if (manual || !zoek.trim()) return data;
    const term = zoek.trim().toLowerCase();
    return data.filter((rij) =>
      columns.some((kolom) => tekstVan(waardeVan(rij, kolom)).toLowerCase().includes(term))
    );
  }, [data, columns, zoek, manual, waardeVan]);

  const gesorteerd = React.useMemo(() => {
    if (manual || !huidigeSort) return gefilterd;
    const kolom = columns.find((item) => item.key === huidigeSort.key);
    if (!kolom) return gefilterd;
    const richting = huidigeSort.direction === "asc" ? 1 : -1;
    return [...gefilterd].sort((a, b) => vergelijk(waardeVan(a, kolom), waardeVan(b, kolom)) * richting);
  }, [gefilterd, columns, huidigeSort, manual, waardeVan]);

  const totaalRijen = total ?? gesorteerd.length;
  const paginas = pageSize ? Math.max(Math.ceil(totaalRijen / pageSize), 1) : 1;
  const pagina = Math.min(huidigePagina, paginas);

  const zichtbaar = React.useMemo(() => {
    if (!pageSize || manual) return gesorteerd;
    const start = (pagina - 1) * pageSize;
    return gesorteerd.slice(start, start + pageSize);
  }, [gesorteerd, pageSize, pagina, manual]);

  const zetPagina = (volgende: number) => {
    if (page === undefined) setInternePagina(volgende);
    onPageChange?.(volgende);
  };

  const klikKop = (kolom: DataTableColumn<T>) => {
    if (!kolom.sortable) return;
    /* Derde klik zet het sorteren weer uit, zodat de oorspronkelijke volgorde terugkomt. */
    const volgende: DataTableSort | null =
      huidigeSort?.key !== kolom.key
        ? { key: kolom.key, direction: "asc" }
        : huidigeSort.direction === "asc"
          ? { key: kolom.key, direction: "desc" }
          : null;
    if (sort === undefined) setInterneSort(volgende);
    onSortChange?.(volgende);
  };

  const zichtbareSleutels = zichtbaar.map((rij, index) => sleutel(rij, index));
  const allesAan = zichtbareSleutels.length > 0 && zichtbareSleutels.every((k) => selectie.includes(k));
  const sommigeAan = !allesAan && zichtbareSleutels.some((k) => selectie.includes(k));

  const wisselAlles = () => {
    if (allesAan) zetSelectie(selectie.filter((k) => !zichtbareSleutels.includes(k)));
    else zetSelectie([...new Set([...selectie, ...zichtbareSleutels])]);
  };

  const wisselRij = (k: string) =>
    zetSelectie(selectie.includes(k) ? selectie.filter((item) => item !== k) : [...selectie, k]);

  const kolomAantal = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const heeftBalk = searchable || toolbar || actions || (selectable && selectie.length > 0);

  return (
    <div
      className={cn("lui-datatable", className)}
      data-header={headerTone === "accent" ? "accent" : undefined}
      data-hoverable={hoverable ? "" : undefined}
      {...rest}
    >
      {heeftBalk && (
        <div className="lui-datatable-bar">
          {searchable && (
            <Input
              value={zoek}
              onChange={(event) => zetZoek(event.target.value)}
              placeholder={searchPlaceholder}
              prefix={<Icon name="search" size={16} />}
              suffix={
                zoek ? (
                  <button
                    type="button"
                    className="lui-datatable-clear"
                    onClick={() => zetZoek("")}
                    aria-label="Zoekterm wissen"
                  >
                    <Icon name="x" size={14} />
                  </button>
                ) : undefined
              }
              className="lui-datatable-search"
              aria-label={searchPlaceholder}
            />
          )}
          {toolbar}
          {selectable && selectie.length > 0 && (
            <div className="lui-datatable-selection">
              <span className="lui-datatable-count">{selectie.length} geselecteerd</span>
              {selectionActions}
            </div>
          )}
          {actions && <div className="lui-datatable-actions">{actions}</div>}
        </div>
      )}

      <Table
        dense={dense}
        striped={striped}
        stickyHeader={stickyHeader}
        maxHeight={maxHeight}
        minWidth={minWidth}
      >
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="lui-datatable-check">
                <Checkbox
                  checked={allesAan}
                  indeterminate={sommigeAan}
                  onChange={wisselAlles}
                  aria-label="Alle zichtbare rijen selecteren"
                />
              </TableHead>
            )}
            {columns.map((kolom) => (
              <TableHead
                key={kolom.key}
                align={kolom.align}
                sortable={kolom.sortable}
                sorted={huidigeSort?.key === kolom.key ? huidigeSort.direction : false}
                onClick={() => klikKop(kolom)}
                style={kolom.width !== undefined ? { width: kolom.width } : undefined}
                data-hide-below={kolom.hideBelow}
              >
                {kolom.header}
              </TableHead>
            ))}
            {rowActions && (
              <TableHead align="right" className="lui-datatable-rowactions-head">
                {rowActionsLabel}
              </TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading
            ? Array.from({ length: loadingRows }, (_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: kolomAantal }, (_, cel) => (
                    <TableCell key={cel}>
                      <Skeleton height={14} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : zichtbaar.map((rij, index) => {
                const k = sleutel(rij, index);
                const aan = selectie.includes(k);
                return (
                  <TableRow
                    key={k}
                    data-selected={aan ? "" : undefined}
                    onClick={onRowClick ? () => onRowClick(rij, index) : undefined}
                    className={onRowClick ? "lui-datatable-row-clickable" : undefined}
                  >
                    {selectable && (
                      <TableCell
                        className="lui-datatable-check"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Checkbox checked={aan} onChange={() => wisselRij(k)} aria-label="Rij selecteren" />
                      </TableCell>
                    )}
                    {columns.map((kolom) => (
                      <TableCell
                        key={kolom.key}
                        align={kolom.align}
                        strong={kolom.strong}
                        data-hide-below={kolom.hideBelow}
                      >
                        {kolom.cell ? kolom.cell(rij, index) : tekstVan(waardeVan(rij, kolom))}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell
                        align="right"
                        className="lui-datatable-rowactions"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className="lui-datatable-more" aria-label="Rijacties">
                              <Icon name="more" size={16} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" minWidth={170}>
                            {rowActions(rij, index)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>

      {!loading && zichtbaar.length === 0 && (
        <div className="lui-datatable-empty">
          <EmptyState
            icon={<Icon name="search" size={22} />}
            title={emptyTitle}
            description={emptyDescription}
            size="sm"
          />
        </div>
      )}

      {(pageSize || summary) && !loading && zichtbaar.length > 0 && (
        <div className="lui-datatable-foot">
          <span className="lui-datatable-summary">
            {summary
              ? summary(zichtbaar.length, totaalRijen)
              : pageSize && !manual
                ? `${(pagina - 1) * pageSize + 1}–${(pagina - 1) * pageSize + zichtbaar.length} van ${totaalRijen}`
                : `${zichtbaar.length} van ${totaalRijen} rij${totaalRijen === 1 ? "" : "en"}`}
          </span>
          {pageSize && paginas > 1 && (
            <Pagination page={pagina} pageCount={paginas} onPageChange={zetPagina} />
          )}
        </div>
      )}
    </div>
  );
}
