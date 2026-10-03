"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Switch } from "./switch";

export interface CookieCategory {
  /** Sleutel in het toestemmingsobject, bv. "statistieken". */
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Altijd aan en niet uit te zetten (functioneel noodzakelijk). */
  required?: boolean;
  /** Stand bij de eerste keer openen van de instellingen. */
  defaultEnabled?: boolean;
}

export type CookieConsentValue = Record<string, boolean>;

export interface CookieConsentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onChange"> {
  /** De categorieën; de eerste is meestal de noodzakelijke. */
  categories?: CookieCategory[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Link naar je cookiebeleid. */
  policyHref?: string;
  policyLabel?: React.ReactNode;
  acceptLabel?: string;
  rejectLabel?: string;
  settingsLabel?: string;
  saveLabel?: string;
  /** Aangeroepen met de keuze van de bezoeker. */
  onDecision?: (value: CookieConsentValue) => void;
  /** Sleutel in localStorage; leeg laten zet het bewaren uit. */
  storageKey?: string | null;
  /** Hoe lang de keuze meegaat, in dagen. */
  expiresInDays?: number;
  /** Zichtbaarheid zelf sturen in plaats van via de opslag. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: "bottom" | "bottom-left" | "bottom-right" | "center";
  /** Scherm erachter afdekken, zodat er eerst gekozen moet worden. */
  blocking?: boolean;
}

export const DEFAULT_COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "noodzakelijk",
    label: "Noodzakelijk",
    description: "Nodig om de site te laten werken: inloggen, taalkeuze, winkelmandje.",
    required: true,
  },
  {
    id: "voorkeuren",
    label: "Voorkeuren",
    description: "Onthoudt instellingen zoals je thema of je regio.",
  },
  {
    id: "statistieken",
    label: "Statistieken",
    description: "Anonieme cijfers over welke pagina's bezocht worden.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Advertenties afstemmen op je interesses, ook op andere sites.",
  },
];

interface BewaardeKeuze {
  value: CookieConsentValue;
  at: number;
}

/** Leest een eerdere keuze; verlopen of onleesbaar telt als geen keuze. */
export function readConsent(
  storageKey: string,
  expiresInDays = 180
): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const ruw = window.localStorage.getItem(storageKey);
    if (!ruw) return null;
    const bewaard = JSON.parse(ruw) as BewaardeKeuze;
    if (!bewaard?.value || typeof bewaard.at !== "number") return null;
    if (Date.now() - bewaard.at > expiresInDays * 86400000) return null;
    return bewaard.value;
  } catch {
    return null;
  }
}

/**
 * CookieConsent — toestemmingsbalk met categorieën, zoals de GDPR ze verlangt:
 * weigeren is even makkelijk als aanvaarden, en niets staat vooraf aan behalve
 * wat echt noodzakelijk is.
 */
export const CookieConsent = React.forwardRef<HTMLDivElement, CookieConsentProps>(
  function CookieConsent(
    {
      categories = DEFAULT_COOKIE_CATEGORIES,
      title = "Cookies op deze site",
      description = "We gebruiken cookies om de site te laten werken. Met je toestemming meten we ook het gebruik. Je keuze kan je later aanpassen.",
      policyHref,
      policyLabel = "Cookiebeleid",
      acceptLabel = "Alles aanvaarden",
      rejectLabel = "Alleen noodzakelijke",
      settingsLabel = "Instellingen",
      saveLabel = "Keuze bewaren",
      onDecision,
      storageKey = "lui-cookie-consent",
      expiresInDays = 180,
      open,
      onOpenChange,
      position = "bottom",
      blocking,
      className,
      ...rest
    },
    ref
  ) {
    /* Server en eerste render tonen niets: anders flitst de balk bij iemand
       die allang gekozen heeft. */
    const [zichtbaar, setZichtbaar] = React.useState(false);
    const [details, setDetails] = React.useState(false);

    React.useEffect(() => {
      if (open !== undefined) return;
      if (!storageKey) {
        setZichtbaar(true);
        return;
      }
      setZichtbaar(readConsent(storageKey, expiresInDays) === null);
    }, [open, storageKey, expiresInDays]);

    const toont = open ?? zichtbaar;

    const [keuze, setKeuze] = React.useState<CookieConsentValue>(() =>
      Object.fromEntries(
        categories.map((categorie) => [categorie.id, Boolean(categorie.required || categorie.defaultEnabled)])
      )
    );

    const sluit = (waarde: CookieConsentValue) => {
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify({ value: waarde, at: Date.now() }));
        } catch {
          /* Privémodus of geblokkeerde opslag: de keuze geldt dan alleen nu. */
        }
      }
      onDecision?.(waarde);
      if (open === undefined) setZichtbaar(false);
      onOpenChange?.(false);
    };

    const alles = () => sluit(Object.fromEntries(categories.map((c) => [c.id, true])));
    const geen = () => sluit(Object.fromEntries(categories.map((c) => [c.id, Boolean(c.required)])));

    if (!toont) return null;

    const paneel = (
      <div
        ref={ref}
        className={cn("lui-cookies", `lui-cookies-${position}`, className)}
        role="dialog"
        aria-modal={blocking || undefined}
        aria-label={typeof title === "string" ? title : "Cookies"}
        {...rest}
      >
        <div className="lui-cookies-head">
          <span className="lui-cookies-icon">
            <Icon name="shield" size={17} />
          </span>
          <div className="lui-cookies-text">
            <p className="lui-cookies-title">{title}</p>
            <p className="lui-cookies-desc">
              {description}
              {policyHref && (
                <>
                  {" "}
                  <a href={policyHref} className="lui-cookies-policy">
                    {policyLabel}
                  </a>
                </>
              )}
            </p>
          </div>
        </div>

        {details && (
          <ul className="lui-cookies-list">
            {categories.map((categorie) => (
              <li className="lui-cookies-item" key={categorie.id}>
                <div className="lui-cookies-item-text">
                  <span className="lui-cookies-item-label">{categorie.label}</span>
                  {categorie.description && (
                    <span className="lui-cookies-item-desc">{categorie.description}</span>
                  )}
                </div>
                <Switch
                  checked={categorie.required ? true : Boolean(keuze[categorie.id])}
                  disabled={categorie.required}
                  onCheckedChange={(aan) => setKeuze((vorige) => ({ ...vorige, [categorie.id]: aan }))}
                  aria-label={typeof categorie.label === "string" ? categorie.label : categorie.id}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="lui-cookies-actions">
          <button
            type="button"
            className="lui-cookies-btn"
            data-ghost=""
            onClick={() => setDetails(!details)}
            aria-expanded={details}
          >
            {settingsLabel}
          </button>
          <span className="lui-cookies-spacer" />
          {details ? (
            <>
              <button type="button" className="lui-cookies-btn" onClick={geen}>
                {rejectLabel}
              </button>
              <button type="button" className="lui-cookies-btn" data-primary="" onClick={() => sluit(keuze)}>
                {saveLabel}
              </button>
            </>
          ) : (
            <>
              <button type="button" className="lui-cookies-btn" onClick={geen}>
                {rejectLabel}
              </button>
              <button type="button" className="lui-cookies-btn" data-primary="" onClick={alles}>
                {acceptLabel}
              </button>
            </>
          )}
        </div>
      </div>
    );

    if (!blocking) return paneel;
    return (
      <div className="lui-cookies-backdrop">
        {paneel}
      </div>
    );
  }
);
