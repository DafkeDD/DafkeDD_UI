"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Portal } from "../lib/portal";
import { useAnchorPosition } from "../lib/anchor";
import { useControllableState, useEscapeKey, useOutsideClick, usePresence } from "../lib/hooks";
import { useFieldProps } from "./field";

export interface AutocompleteOption {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AutocompleteProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "onSelect" | "size" | "prefix"> {
  /** De getypte tekst (controlled). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Suggesties; strings mogen ook. */
  options: Array<AutocompleteOption | string>;
  /** Wordt aangeroepen wanneer je een suggestie kiest. */
  onSelect?: (option: AutocompleteOption) => void;
  /** Zelf filteren (bv. serverkant); standaard filtert het component op "bevat". */
  filter?: false | ((option: AutocompleteOption, query: string) => boolean);
  /** Toont een spinner-regel in de lijst. */
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  prefix?: React.ReactNode;
  /** Maximum aantal getoonde suggesties. */
  maxResults?: number;
  /** Opent de lijst zodra het veld focus krijgt, ook zonder tekst. */
  openOnFocus?: boolean;
  invalid?: boolean;
}

const normaliseer = (optie: AutocompleteOption | string): AutocompleteOption =>
  typeof optie === "string" ? { value: optie } : optie;

/**
 * Autocomplete — vrij tekstveld met suggesties eronder. Anders dan Combobox mag
 * je hier alles typen: de lijst helpt, maar dwingt niets af.
 */
export const Autocomplete = React.forwardRef<HTMLInputElement, AutocompleteProps>(
  function Autocomplete(
    {
      value,
      defaultValue = "",
      onValueChange,
      options,
      onSelect,
      filter,
      loading,
      loadingLabel = "Zoeken…",
      emptyLabel = "Niets gevonden",
      size = "md",
      prefix,
      maxResults = 8,
      openOnFocus,
      invalid,
      disabled,
      className,
      ...props
    },
    ref
  ) {
    const merged = useFieldProps(props as Parameters<typeof useFieldProps>[0]) as typeof props & {
      invalid?: boolean;
      id?: string;
    };
    const { invalid: veldFout, id, ...rest } = merged;
    const fout = invalid ?? veldFout;

    const [tekst, setTekst] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const [open, setOpen] = React.useState(false);
    const [actief, setActief] = React.useState(0);

    const veld = React.useRef<HTMLInputElement | null>(null);
    const anker = React.useRef<HTMLDivElement | null>(null);
    const lijst = React.useRef<HTMLUListElement | null>(null);
    const lijstId = React.useId();

    const { render: zichtbaar, state: fase } = usePresence(open, lijst, 160);
    const positie = useAnchorPosition(anker, lijst, zichtbaar, {
      side: "bottom",
      align: "start",
      offset: 6,
      matchWidth: true,
    });

    useOutsideClick([anker, lijst], () => setOpen(false), open);
    useEscapeKey(() => setOpen(false), open);

    const alles = React.useMemo(() => options.map(normaliseer), [options]);
    const gevonden = React.useMemo(() => {
      if (filter === false) return alles.slice(0, maxResults);
      const query = tekst.trim().toLowerCase();
      const test =
        filter ??
        ((optie: AutocompleteOption, zoek: string) =>
          `${optie.value} ${typeof optie.label === "string" ? optie.label : ""} ${
            typeof optie.description === "string" ? optie.description : ""
          }`
            .toLowerCase()
            .includes(zoek));
      return (query ? alles.filter((optie) => test(optie, query)) : alles).slice(0, maxResults);
    }, [alles, filter, maxResults, tekst]);

    React.useEffect(() => setActief(0), [tekst, open]);

    const kies = (optie: AutocompleteOption) => {
      if (optie.disabled) return;
      setTekst(optie.value);
      onSelect?.(optie);
      setOpen(false);
      veld.current?.focus();
    };

    const opToets = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        setOpen(true);
        return;
      }
      if (!open) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActief((vorig) => (vorig + 1) % Math.max(gevonden.length, 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActief((vorig) => (vorig - 1 + gevonden.length) % Math.max(gevonden.length, 1));
      } else if (event.key === "Enter") {
        const optie = gevonden[actief];
        if (optie) {
          event.preventDefault();
          kies(optie);
        }
      } else if (event.key === "Tab") {
        setOpen(false);
      }
    };

    return (
      <div
        ref={anker}
        className={cn("lui-autocomplete", `lui-autocomplete-${size}`, className)}
        data-disabled={disabled ? "" : undefined}
      >
        {prefix && <span className="lui-autocomplete-prefix">{prefix}</span>}
        <input
          ref={(node) => {
            veld.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
          }}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={lijstId}
          aria-autocomplete="list"
          aria-activedescendant={open && gevonden[actief] ? `${lijstId}-${actief}` : undefined}
          aria-invalid={fout || undefined}
          autoComplete="off"
          disabled={disabled}
          className="lui-autocomplete-input"
          value={tekst}
          onChange={(event) => {
            setTekst(event.target.value);
            setOpen(true);
          }}
          onFocus={() => openOnFocus && setOpen(true)}
          onKeyDown={opToets}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {tekst && !disabled && (
          <button
            type="button"
            className="lui-autocomplete-clear"
            aria-label="Wissen"
            onClick={() => {
              setTekst("");
              veld.current?.focus();
            }}
          >
            <Icon name="x" size={14} />
          </button>
        )}

        {zichtbaar && (
          <Portal>
            <ul
              ref={lijst}
              id={lijstId}
              role="listbox"
              className="lui-autocomplete-list" data-state={fase} data-side={positie.side}
              style={positie.style}
            >
              {loading && <li className="lui-autocomplete-status">{loadingLabel}</li>}
              {!loading && gevonden.length === 0 && (
                <li className="lui-autocomplete-status">{emptyLabel}</li>
              )}
              {gevonden.map((optie, index) => (
                <li
                  key={optie.value}
                  id={`${lijstId}-${index}`}
                  role="option"
                  aria-selected={index === actief}
                  aria-disabled={optie.disabled || undefined}
                  data-active={index === actief ? "" : undefined}
                  className="lui-autocomplete-option"
                  onMouseEnter={() => setActief(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => kies(optie)}
                >
                  {optie.icon && <span className="lui-autocomplete-icon">{optie.icon}</span>}
                  <span className="lui-autocomplete-text">
                    <span>{optie.label ?? optie.value}</span>
                    {optie.description && (
                      <span className="lui-autocomplete-desc">{optie.description}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Portal>
        )}
      </div>
    );
  }
);
