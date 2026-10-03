"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Aantal paginaknoppen rond de huidige pagina. */
  siblings?: number;
  /** Toont "Vorige"/"Volgende" met tekst in plaats van alleen pijlen. */
  showLabels?: boolean;
  /** Tekst links, bv. "1–10 van 84". */
  summary?: React.ReactNode;
}

/** Pagination — paginanavigatie met ellipsis. */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, pageCount, onPageChange, siblings = 1, showLabels, summary, className, ...rest },
  ref
) {
  const pages = buildRange(page, pageCount, siblings);

  return (
    <nav ref={ref} aria-label="Paginering" className={cn("lui-pagination", className)} {...rest}>
      {summary && <div className="lui-pagination-summary">{summary}</div>}
      <div className="lui-pagination-controls">
        <button
          type="button"
          className="lui-pagination-btn"
          disabled={page <= 1}
          aria-label="Vorige pagina"
          onClick={() => onPageChange(page - 1)}
        >
          <Icon name="chevronLeft" size={16} />
          {showLabels && <span>Vorige</span>}
        </button>

        {pages.map((entry, index) =>
          entry === "…" ? (
            <span key={`gap-${index}`} className="lui-pagination-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              className={cn("lui-pagination-btn", entry === page && "lui-pagination-btn-active")}
              aria-current={entry === page ? "page" : undefined}
              onClick={() => onPageChange(entry)}
            >
              {entry}
            </button>
          )
        )}

        <button
          type="button"
          className="lui-pagination-btn"
          disabled={page >= pageCount}
          aria-label="Volgende pagina"
          onClick={() => onPageChange(page + 1)}
        >
          {showLabels && <span>Volgende</span>}
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </nav>
  );
});

function buildRange(page: number, pageCount: number, siblings: number): Array<number | "…"> {
  const total = siblings * 2 + 5;
  if (pageCount <= total) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, pageCount);
  const showLeftGap = left > 2;
  const showRightGap = right < pageCount - 1;

  const range: Array<number | "…"> = [1];
  if (showLeftGap) range.push("…");
  for (let index = Math.max(2, left); index <= Math.min(pageCount - 1, right); index += 1) range.push(index);
  if (showRightGap) range.push("…");
  range.push(pageCount);
  return range;
}
