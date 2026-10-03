"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface Citation {
  id: string;
  title: React.ReactNode;
  /** Adres van de bron; maakt het bolletje en de rij klikbaar. */
  url?: string;
  /** Domein of bestandsnaam onder de titel. */
  source?: React.ReactNode;
  /** Het aangehaalde stukje tekst. */
  snippet?: React.ReactNode;
}

interface CitationsContextValue {
  bronnen: Citation[];
  actief: string | null;
  setActief: (id: string | null) => void;
}

const CitationsContext = React.createContext<CitationsContextValue | null>(null);

export interface CitationsProps extends React.HTMLAttributes<HTMLDivElement> {
  sources: Citation[];
  /** De bronnenlijst onderaan verbergen. */
  hideList?: boolean;
  listLabel?: React.ReactNode;
  /** De lijst ingeklapt beginnen. */
  collapsed?: boolean;
}

/**
 * Citations — omhulsel voor tekst met bronverwijzingen. Zet er `CitationMark`
 * in en onderaan verschijnt de bijbehorende lijst; het bolletje en de rij
 * lichten samen op.
 */
export const Citations = React.forwardRef<HTMLDivElement, CitationsProps>(function Citations(
  { sources, hideList, listLabel = "Bronnen", collapsed, className, children, ...rest },
  ref
) {
  const [actief, setActief] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(!collapsed);

  return (
    <CitationsContext.Provider value={{ bronnen: sources, actief, setActief }}>
      <div ref={ref} className={cn("lui-cites", className)} {...rest}>
        <div className="lui-cites-text">{children}</div>

        {!hideList && sources.length > 0 && (
          <div className="lui-cites-list">
            <button
              type="button"
              className="lui-cites-toggle"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
            >
              {listLabel}
              <span className="lui-cites-count">{sources.length}</span>
              <span className="lui-cites-chevron" data-open={open ? "" : undefined} aria-hidden="true" />
            </button>

            {open && (
              <ol className="lui-cites-items">
                {sources.map((bron, index) => {
                  const inhoud = (
                    <>
                      <span className="lui-cites-num">{index + 1}</span>
                      <span className="lui-cites-body">
                        <span className="lui-cites-title">{bron.title}</span>
                        {bron.source && <span className="lui-cites-source">{bron.source}</span>}
                        {bron.snippet && <span className="lui-cites-snippet">{bron.snippet}</span>}
                      </span>
                      {bron.url && <Icon name="externalLink" size={13} className="lui-cites-ext" />}
                    </>
                  );
                  return (
                    <li
                      key={bron.id}
                      className="lui-cites-item"
                      data-active={actief === bron.id ? "" : undefined}
                      onMouseEnter={() => setActief(bron.id)}
                      onMouseLeave={() => setActief(null)}
                    >
                      {bron.url ? (
                        <a href={bron.url} target="_blank" rel="noreferrer" className="lui-cites-link">
                          {inhoud}
                        </a>
                      ) : (
                        <span className="lui-cites-link">{inhoud}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        )}
      </div>
    </CitationsContext.Provider>
  );
});

export interface CitationMarkProps extends React.HTMLAttributes<HTMLElement> {
  /** Verwijst naar een id uit `sources`. */
  id: string;
}

/**
 * CitationMark — het bolletje in de lopende tekst. Zweven licht de bijhorende
 * rij in de bronnenlijst op, en omgekeerd.
 */
export const CitationMark = React.forwardRef<HTMLElement, CitationMarkProps>(function CitationMark(
  { id, className, ...rest },
  ref
) {
  const context = React.useContext(CitationsContext);
  if (!context) throw new Error("CitationMark moet binnen <Citations> staan.");

  const index = context.bronnen.findIndex((bron) => bron.id === id);
  if (index === -1) return null;
  const bron = context.bronnen[index];

  const inhoud = (
    <>
      {index + 1}
      <span className="lui-cite-tip" role="tooltip">
        <span className="lui-cite-tip-title">{bron.title}</span>
        {bron.source && <span className="lui-cite-tip-source">{bron.source}</span>}
      </span>
    </>
  );

  const gedeeld = {
    className: cn("lui-cite", className),
    "data-active": context.actief === id ? "" : undefined,
    onMouseEnter: () => context.setActief(id),
    onMouseLeave: () => context.setActief(null),
    onFocus: () => context.setActief(id),
    onBlur: () => context.setActief(null),
  };

  if (bron.url) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={bron.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Bron ${index + 1}`}
        {...gedeeld}
        {...rest}
      >
        {inhoud}
      </a>
    );
  }

  return (
    <sup ref={ref as React.Ref<HTMLElement>} aria-label={`Bron ${index + 1}`} {...gedeeld} {...rest}>
      {inhoud}
    </sup>
  );
});

export interface UsageQuotaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wat er al verbruikt is. */
  used: number;
  /** Wat er in totaal mag. */
  limit: number;
  label?: React.ReactNode;
  /** Eenheid achter de getallen, bv. " berichten". */
  unit?: React.ReactNode;
  /** Wanneer de teller weer op nul gaat. */
  resetAt?: Date | string;
  /** Vanaf welk aandeel de balk amber en rood wordt. */
  thresholds?: [number, number];
  /** Compacte regel zonder balk. */
  compact?: boolean;
  formatValue?: (value: number) => string;
  locale?: string;
  /** Knop rechts, bv. "Upgraden". */
  action?: React.ReactNode;
}

/**
 * UsageQuota — hoeveel van een limiet er op is, wanneer hij weer aanvult, en
 * een waarschuwingskleur zodra het krap wordt.
 */
export const UsageQuota = React.forwardRef<HTMLDivElement, UsageQuotaProps>(function UsageQuota(
  {
    used,
    limit,
    label = "Verbruik",
    unit,
    resetAt,
    thresholds = [0.75, 0.92],
    compact,
    formatValue,
    locale = "nl-BE",
    action,
    className,
    ...rest
  },
  ref
) {
  const deel = limit > 0 ? Math.min(Math.max(used / limit, 0), 1) : 0;
  const toon = deel >= thresholds[1] ? "red" : deel >= thresholds[0] ? "amber" : "accent";
  const opmaak = (waarde: number) =>
    formatValue ? formatValue(waarde) : waarde.toLocaleString(locale);

  const reset = React.useMemo(() => {
    if (!resetAt) return null;
    const datum = resetAt instanceof Date ? resetAt : new Date(resetAt);
    if (Number.isNaN(datum.getTime())) return null;
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(datum);
  }, [resetAt, locale]);

  return (
    <div
      ref={ref}
      className={cn("lui-quota", compact && "lui-quota-compact", className)}
      data-tone={toon}
      {...rest}
    >
      <div className="lui-quota-head">
        <span className="lui-quota-label">{label}</span>
        <span className="lui-quota-value">
          {opmaak(used)} / {opmaak(limit)}
          {unit}
        </span>
      </div>

      {!compact && (
        <div
          className="lui-quota-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={used}
          aria-label={typeof label === "string" ? label : undefined}
        >
          <span className="lui-quota-fill" style={{ width: `${deel * 100}%` }} />
        </div>
      )}

      {(reset || action) && (
        <div className="lui-quota-foot">
          {reset && (
            <span className="lui-quota-reset">
              <Icon name="refresh" size={13} />
              Vult aan op {reset}
            </span>
          )}
          {action}
        </div>
      )}
    </div>
  );
});
