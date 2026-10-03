"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Kbd } from "./kbd";
import { useControllableState, useOutsideClick } from "../lib/hooks";

export interface SearchSuggestion {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
}

export interface SearchFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "onSelect" | "size" | "type"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Uitgevoerd bij Enter of een klik op een voorstel of recente zoekopdracht. */
  onSearch?: (value: string) => void;
  /** Voorstellen onder het veld. */
  suggestions?: Array<SearchSuggestion | string>;
  /** Zelf filteren uitzetten, bv. als de server het al deed. */
  filter?: boolean;
  /** Eerdere zoekopdrachten als chips, met een knop om ze te wissen. */
  recent?: string[];
  onRecentClear?: () => void;
  onRecentSelect?: (value: string) => void;
  /**
   * Sneltoets die in het veld getoond wordt én echt werkt, bv. "Ctrl K" of "⌘ K".
   * Ctrl en ⌘ worden allebei aanvaard, zodat hij op Windows en Mac werkt.
   */
  shortcut?: string;
  /**
   * Begint als rond icoonknopje dat vanuit zichzelf openschuift tot een veld.
   * Escape of een klik ernaast klapt het weer dicht.
   */
  expandable?: boolean;
  /** Breedte in uitgeklapte staat. */
  expandedWidth?: number;
  /** Zwevende deeltjes rond het uitgeklapte veld. */
  particles?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  emptyLabel?: React.ReactNode;
  suggestionsLabel?: React.ReactNode;
  recentLabel?: React.ReactNode;
  clearLabel?: string;
  /** Tekst onder het veld, bv. "Esc om te sluiten". Standaard aan bij expandable. */
  hint?: React.ReactNode | false;
  maxResults?: number;
}

const alsVoorstel = (item: SearchSuggestion | string): SearchSuggestion =>
  typeof item === "string" ? { value: item } : item;

/** Haalt de toets uit "Ctrl K", "⌘K" of "Mod+K": het laatste letter- of cijferteken. */
function toetsUit(sneltoets?: string): string | null {
  if (!sneltoets) return null;
  const tekens = sneltoets.replace(/[^a-z0-9/]/gi, "");
  return tekens ? tekens.slice(-1).toLowerCase() : null;
}

const DEELTJES = [
  { x: "8%", y: "-38%", d: 0 },
  { x: "22%", y: "130%", d: 0.9 },
  { x: "48%", y: "-46%", d: 1.6 },
  { x: "71%", y: "138%", d: 0.4 },
  { x: "88%", y: "-30%", d: 1.2 },
  { x: "96%", y: "112%", d: 2.1 },
];

/**
 * SearchField — zoekveld met voorstellen, recente zoekopdrachten en een
 * werkende sneltoets. Met `expandable` begint het als rond knopje dat vanuit
 * zichzelf openschuift tot een veld.
 */
export const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSearch,
    suggestions,
    filter = true,
    recent,
    onRecentClear,
    onRecentSelect,
    shortcut,
    expandable,
    expandedWidth = 340,
    particles = true,
    open,
    defaultOpen,
    onOpenChange,
    size = "md",
    loading,
    emptyLabel = "Niets gevonden",
    suggestionsLabel = "Voorstellen",
    recentLabel = "Recent gezocht",
    clearLabel = "Wissen",
    hint,
    maxResults = 8,
    placeholder = "Zoeken…",
    disabled,
    className,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const [tekst, setTekst] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  /* Bij expandable is "uit" of het veld openstaat; anders staat het altijd open. */
  const [uit, setUit] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? !expandable,
    onChange: onOpenChange,
  });
  const veldOpen = expandable ? uit : true;

  const [paneel, setPaneel] = React.useState(false);
  const [actief, setActief] = React.useState(-1);
  const wikkel = React.useRef<HTMLDivElement>(null);
  const veld = React.useRef<HTMLInputElement>(null);

  const zetRef = (node: HTMLInputElement | null) => {
    (veld as React.MutableRefObject<HTMLInputElement | null>).current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const sluit = React.useCallback(() => {
    setPaneel(false);
    setActief(-1);
    if (expandable) setUit(false);
  }, [expandable, setUit]);

  useOutsideClick([wikkel], sluit, paneel || (expandable && uit));

  /* De sneltoets echt laten werken, niet alleen tonen. */
  const toets = toetsUit(shortcut);
  React.useEffect(() => {
    if (!toets || disabled) return;
    const opToets = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== toets) return;
      event.preventDefault();
      if (expandable) setUit(true);
      window.requestAnimationFrame(() => veld.current?.focus());
    };
    window.addEventListener("keydown", opToets);
    return () => window.removeEventListener("keydown", opToets);
  }, [toets, disabled, expandable, setUit]);

  /* Na het openschuiven meteen de cursor in het veld, als de animatie loopt. */
  React.useEffect(() => {
    if (expandable && uit) {
      const timer = window.setTimeout(() => veld.current?.focus(), 60);
      return () => window.clearTimeout(timer);
    }
  }, [expandable, uit]);

  const lijst = React.useMemo(() => {
    const alle = (suggestions ?? []).map(alsVoorstel);
    const term = tekst.trim().toLowerCase();
    const gefilterd =
      filter && term
        ? alle.filter(
            (item) =>
              item.value.toLowerCase().includes(term) ||
              (typeof item.label === "string" && item.label.toLowerCase().includes(term))
          )
        : alle;
    return gefilterd.slice(0, maxResults);
  }, [suggestions, tekst, filter, maxResults]);

  const recenten = recent ?? [];
  const heeftInhoud = loading || lijst.length > 0 || recenten.length > 0 || Boolean(tekst);
  const toontPaneel = veldOpen && paneel && heeftInhoud;
  const kiesbaar = [...lijst.map((item) => item.value), ...recenten];

  const kies = (waarde: string, uitRecent = false) => {
    setTekst(waarde);
    setActief(-1);
    setPaneel(false);
    if (uitRecent) onRecentSelect?.(waarde);
    onSearch?.(waarde);
  };

  const opToets = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      /* Eerst het paneel, dan de tekst, pas dan het hele veld dicht. */
      if (paneel && heeftInhoud) setPaneel(false);
      else if (tekst) setTekst("");
      else sluit();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (kiesbaar.length === 0) return;
      event.preventDefault();
      setPaneel(true);
      const stap = event.key === "ArrowDown" ? 1 : -1;
      const grens = kiesbaar.length;
      setActief((vorige) => {
        const volgende = vorige + stap;
        if (volgende < 0) return grens - 1;
        if (volgende >= grens) return 0;
        return volgende;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (actief >= 0 && kiesbaar[actief]) kies(kiesbaar[actief], actief >= lijst.length);
      else if (tekst.trim()) kies(tekst.trim());
    }
  };

  const toonHint = hint !== false && (hint !== undefined || expandable);
  const hintInhoud =
    hint && hint !== true ? (
      hint
    ) : (
      <>
        <Kbd>Esc</Kbd> om te sluiten
      </>
    );

  return (
    <div
      ref={wikkel}
      className={cn(
        "lui-searchfield",
        `lui-searchfield-${size}`,
        expandable && "lui-searchfield-expandable",
        className
      )}
      data-open={veldOpen ? "" : undefined}
      style={
        expandable
          ? ({ ...style, ["--lui-sf-open" as string]: `${expandedWidth}px` } as React.CSSProperties)
          : style
      }
    >
      <div className="lui-searchfield-box" data-panel={toontPaneel ? "" : undefined}>
        {expandable && particles && veldOpen && (
          <span className="lui-searchfield-particles" aria-hidden="true">
            {DEELTJES.map((deeltje, index) => (
              <span
                key={index}
                style={{ left: deeltje.x, top: deeltje.y, animationDelay: `${deeltje.d}s` }}
              />
            ))}
          </span>
        )}

        <button
          type="button"
          className="lui-searchfield-icon"
          tabIndex={expandable && !veldOpen ? 0 : -1}
          onClick={() => {
            if (expandable && !veldOpen) setUit(true);
            else veld.current?.focus();
          }}
          disabled={disabled}
          aria-label={expandable && !veldOpen ? (typeof placeholder === "string" ? placeholder : "Zoeken") : undefined}
          aria-hidden={expandable && !veldOpen ? undefined : true}
          aria-expanded={expandable ? veldOpen : undefined}
        >
          <Icon name="search" size={expandable ? 18 : 16} />
        </button>

        <input
          ref={zetRef}
          type="search"
          className="lui-searchfield-input"
          value={tekst}
          placeholder={placeholder}
          disabled={disabled}
          tabIndex={veldOpen ? 0 : -1}
          autoComplete="off"
          role="combobox"
          aria-expanded={toontPaneel}
          aria-autocomplete="list"
          onChange={(event) => {
            setTekst(event.target.value);
            setActief(-1);
            setPaneel(true);
          }}
          onFocus={(event) => {
            setPaneel(true);
            onFocus?.(event);
          }}
          onBlur={onBlur}
          onKeyDown={opToets}
          {...rest}
        />

        {tekst && (
          <button
            type="button"
            className="lui-searchfield-clear"
            onClick={() => {
              setTekst("");
              veld.current?.focus();
            }}
            aria-label="Zoekterm wissen"
          >
            <Icon name="x" size={14} />
          </button>
        )}
        {shortcut && !expandable && <Kbd className="lui-searchfield-kbd">{shortcut}</Kbd>}
      </div>

      {toonHint && veldOpen && !toontPaneel && <p className="lui-searchfield-hint">{hintInhoud}</p>}

      {toontPaneel && (
        <div className="lui-searchfield-panel" role="listbox">
          {loading && <p className="lui-searchfield-loading">Bezig met zoeken…</p>}

          {!loading && lijst.length > 0 && (
            <div className="lui-searchfield-group">
              <p className="lui-searchfield-grouplabel">{suggestionsLabel}</p>
              <div className="lui-searchfield-options">
                {lijst.map((item, index) => (
                  <button
                    key={item.value}
                    type="button"
                    role="option"
                    aria-selected={actief === index}
                    className="lui-searchfield-option"
                    data-active={actief === index ? "" : undefined}
                    onMouseEnter={() => setActief(index)}
                    onClick={() => kies(item.value)}
                  >
                    {item.icon ?? <Icon name="search" size={14} />}
                    <span className="lui-searchfield-optiontext">
                      <span>{item.label ?? item.value}</span>
                      {item.description && <span className="lui-searchfield-desc">{item.description}</span>}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && lijst.length === 0 && tekst && <p className="lui-searchfield-empty">{emptyLabel}</p>}

          {!loading && recenten.length > 0 && (
            <div className="lui-searchfield-group">
              <div className="lui-searchfield-grouprow">
                <p className="lui-searchfield-grouplabel">{recentLabel}</p>
                {onRecentClear && (
                  <button type="button" className="lui-searchfield-clearall" onClick={onRecentClear}>
                    {clearLabel}
                  </button>
                )}
              </div>
              <div className="lui-searchfield-chips">
                {recenten.map((item, index) => {
                  const plek = lijst.length + index;
                  const gekozen = actief === plek || item === tekst;
                  return (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      aria-selected={actief === plek}
                      className="lui-searchfield-chip"
                      data-active={gekozen ? "" : undefined}
                      onMouseEnter={() => setActief(plek)}
                      onClick={() => kies(item, true)}
                    >
                      <Icon name="clock" size={12} />
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {toonHint && <p className="lui-searchfield-hint lui-searchfield-hint-panel">{hintInhoud}</p>}
        </div>
      )}
    </div>
  );
});
