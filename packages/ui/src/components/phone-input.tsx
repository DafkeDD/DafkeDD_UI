"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Portal } from "../lib/portal";
import { useAnchorPosition } from "../lib/anchor";
import { useControllableState, useOutsideClick, useEscapeKey, usePresence } from "../lib/hooks";
import { useFieldProps } from "./field";

export interface PhoneCountry {
  /** ISO 3166-1 alpha-2, bv. "BE". */
  code: string;
  name: string;
  /** Landnummer zonder plus, bv. "32". */
  dial: string;
  /** Vlagje; de emoji wordt anders uit de code afgeleid. */
  flag?: string;
  /** Voorbeeldnummer zonder landnummer, bv. "470 12 34 56". */
  example?: string;
  /** Hoe het nationale deel gegroepeerd wordt. Eerste passende groep wint. */
  groups?: number[][];
}

/** De buurlanden en de talen die je in België tegenkomt, plus wat vaak voorkomt. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "BE", name: "België", dial: "32", example: "470 12 34 56", groups: [[3, 2, 2, 2], [1, 3, 2, 2], [2, 3, 2, 2]] },
  { code: "NL", name: "Nederland", dial: "31", example: "6 12345678", groups: [[1, 8], [2, 7]] },
  { code: "FR", name: "Frankrijk", dial: "33", example: "6 12 34 56 78", groups: [[1, 2, 2, 2, 2]] },
  { code: "DE", name: "Duitsland", dial: "49", example: "151 23456789", groups: [[3, 8], [4, 7]] },
  { code: "LU", name: "Luxemburg", dial: "352", example: "621 123 456", groups: [[3, 3, 3]] },
  { code: "GB", name: "Verenigd Koninkrijk", dial: "44", example: "7400 123456", groups: [[4, 6]] },
  { code: "ES", name: "Spanje", dial: "34", example: "612 34 56 78", groups: [[3, 2, 2, 2]] },
  { code: "IT", name: "Italië", dial: "39", example: "312 345 6789", groups: [[3, 3, 4]] },
  { code: "PT", name: "Portugal", dial: "351", example: "912 345 678", groups: [[3, 3, 3]] },
  { code: "PL", name: "Polen", dial: "48", example: "512 345 678", groups: [[3, 3, 3]] },
  { code: "MA", name: "Marokko", dial: "212", example: "650 123456", groups: [[3, 6]] },
  { code: "TR", name: "Turkije", dial: "90", example: "532 123 45 67", groups: [[3, 3, 2, 2]] },
  { code: "US", name: "Verenigde Staten", dial: "1", example: "201 555 0123", groups: [[3, 3, 4]] },
];

/** Vlagemoji uit de landcode; werkt voor elke geldige alpha-2-code. */
export function flagFor(code: string): string {
  if (code.length !== 2) return "";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((letter) => 0x1f1e6 - 65 + letter.charCodeAt(0))
  );
}

const cijfers = (waarde: string) => waarde.replace(/\D/g, "");

/** Zet het nationale deel in groepjes volgens het land. */
function groepeer(nationaal: string, land: PhoneCountry): string {
  if (!land.groups?.length) return nationaal;
  const passend =
    land.groups.find((groep) => groep.reduce((a, b) => a + b, 0) === nationaal.length) ?? land.groups[0];
  const stukken: string[] = [];
  let index = 0;
  for (const lengte of passend) {
    if (index >= nationaal.length) break;
    stukken.push(nationaal.slice(index, index + lengte));
    index += lengte;
  }
  if (index < nationaal.length) stukken.push(nationaal.slice(index));
  return stukken.join(" ");
}

/** Bouwt de E.164-waarde: plus, landnummer, nationaal deel, zonder spaties. */
export function toE164(dial: string, nationaal: string): string {
  const schoon = cijfers(nationaal).replace(/^0+/, "");
  return schoon ? `+${dial}${schoon}` : "";
}

/** Leest een E.164-nummer terug naar land en nationaal deel. */
export function fromE164(
  waarde: string,
  landen: PhoneCountry[] = PHONE_COUNTRIES
): { country: PhoneCountry; national: string } | null {
  const schoon = waarde.replace(/[^\d+]/g, "");
  if (!schoon.startsWith("+")) return null;
  const zonderPlus = schoon.slice(1);
  /* Langste landnummer eerst, anders vangt "1" ook "1..." van andere landen. */
  const gesorteerd = [...landen].sort((a, b) => b.dial.length - a.dial.length);
  const land = gesorteerd.find((item) => zonderPlus.startsWith(item.dial));
  if (!land) return null;
  return { country: land, national: zonderPlus.slice(land.dial.length) };
}

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size" | "type"> {
  /** Het volledige nummer in E.164, bv. "+32470123456". */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Land van de keuzelijst; zonder dit beheert het veld het zelf. */
  country?: string;
  defaultCountry?: string;
  onCountryChange?: (code: string) => void;
  /** Welke landen in de lijst staan. */
  countries?: PhoneCountry[];
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
  /** Het voorbeeldnummer van het land als placeholder. */
  showExample?: boolean;
  /** Zoekveld boven de landenlijst. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
}

/**
 * PhoneInput — telefoonnummer met landkiezer. De waarde die je terugkrijgt is
 * altijd E.164 (+32470123456); in het veld staat het leesbaar gegroepeerd.
 */
export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    value,
    defaultValue = "",
    onValueChange,
    country,
    defaultCountry = "BE",
    onCountryChange,
    countries = PHONE_COUNTRIES,
    size = "md",
    invalid,
    showExample = true,
    searchable = true,
    searchPlaceholder = "Zoek land…",
    emptyLabel = "Geen land gevonden",
    disabled,
    className,
    ...props
  },
  ref
) {
  const merged = useFieldProps(props as Parameters<typeof useFieldProps>[0]) as typeof props & {
    invalid?: boolean;
    disabled?: boolean;
  };
  const { invalid: veldInvalid, disabled: veldDisabled, ...rest } = merged;
  const isInvalid = invalid ?? veldInvalid;
  const isDisabled = disabled ?? veldDisabled;

  const [volledig, setVolledig] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const gelezen = React.useMemo(() => fromE164(volledig, countries), [volledig, countries]);

  const [internLand, setInternLand] = React.useState(defaultCountry);
  const landCode = country ?? gelezen?.country.code ?? internLand;
  const land = countries.find((item) => item.code === landCode) ?? countries[0];

  const nationaal = gelezen && gelezen.country.code === land.code ? gelezen.national : "";

  /* Wie zelf een + typt, ziet zijn eigen tekens staan tot het veld de focus
     verliest. Zonder dit zou "+31…" na het eerste teken al hergroepeerd worden
     en klopt er niets meer van wat je typt. */
  const [ruwPlus, setRuwPlus] = React.useState<string | null>(null);
  const getoond = ruwPlus ?? groepeer(nationaal, land);

  const zetLand = (code: string) => {
    if (country === undefined) setInternLand(code);
    onCountryChange?.(code);
    const nieuw = countries.find((item) => item.code === code);
    if (nieuw) setVolledig(toE164(nieuw.dial, nationaal));
    setRuwPlus(null);
    setOpen(false);
  };

  const [open, setOpen] = React.useState(false);
  const [zoek, setZoek] = React.useState("");
  const anker = React.useRef<HTMLDivElement>(null);
  const lijst = React.useRef<HTMLDivElement>(null);

  useOutsideClick([anker, lijst], () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);
  const { render: zichtbaar, state: fase } = usePresence(open, lijst, 160);
  const positie = useAnchorPosition(anker, lijst, zichtbaar, {
    side: "bottom",
    align: "start",
    offset: 6,
  });

  React.useEffect(() => {
    if (!open) setZoek("");
  }, [open]);

  const gefilterd = React.useMemo(() => {
    const term = zoek.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.dial.includes(term.replace("+", ""))
    );
  }, [countries, zoek]);

  return (
    <div
      ref={anker}
      className={cn("lui-phone", `lui-phone-${size}`, isInvalid && "lui-phone-invalid", className)}
      data-disabled={isDisabled ? "" : undefined}
    >
      <button
        type="button"
        className="lui-phone-country"
        onClick={() => setOpen(!open)}
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Land: ${land.name} (+${land.dial})`}
      >
        <span className="lui-phone-flag" aria-hidden="true">
          {land.flag ?? flagFor(land.code)}
        </span>
        <span className="lui-phone-dial">+{land.dial}</span>
        <Icon name="chevronDown" size={13} className="lui-phone-chevron" />
      </button>

      <input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="lui-phone-field"
        value={getoond}
        placeholder={showExample ? land.example : undefined}
        disabled={isDisabled}
        aria-invalid={isInvalid || undefined}
        onChange={(event) => {
          const ruw = event.target.value;
          /* Typt of plakt iemand een + met landnummer, dan springt de kiezer mee. */
          if (ruw.trim().startsWith("+")) {
            setRuwPlus(ruw);
            const herkend = fromE164(ruw, countries);
            if (herkend) {
              if (country === undefined) setInternLand(herkend.country.code);
              setVolledig(toE164(herkend.country.dial, herkend.national));
            } else {
              setVolledig("");
            }
            return;
          }
          setRuwPlus(null);
          setVolledig(toE164(land.dial, ruw));
        }}
        onBlur={(event) => {
          /* Bij het verlaten van het veld weer netjes gegroepeerd tonen. */
          setRuwPlus(null);
          rest.onBlur?.(event);
        }}
        {...rest}
      />

      {zichtbaar && (
        <Portal>
          <div
            ref={lijst}
            className="lui-phone-list" data-state={fase} data-side={positie.side}
            role="listbox"
            aria-label="Land kiezen"
            style={{ ...positie.style, minWidth: 260 }}
          >
            {searchable && (
              <div className="lui-phone-search">
                <Icon name="search" size={15} />
                <input
                  value={zoek}
                  onChange={(event) => setZoek(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  autoFocus
                />
              </div>
            )}
            <div className="lui-phone-options">
              {gefilterd.length === 0 && <p className="lui-phone-empty">{emptyLabel}</p>}
              {gefilterd.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  role="option"
                  aria-selected={item.code === land.code}
                  className="lui-phone-option"
                  data-active={item.code === land.code ? "" : undefined}
                  onClick={() => zetLand(item.code)}
                >
                  <span className="lui-phone-flag" aria-hidden="true">
                    {item.flag ?? flagFor(item.code)}
                  </span>
                  <span className="lui-phone-name">{item.name}</span>
                  <span className="lui-phone-code">+{item.dial}</span>
                </button>
              ))}
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
});
