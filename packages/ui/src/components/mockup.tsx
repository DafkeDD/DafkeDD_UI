"use client";
import * as React from "react";
import { cn } from "../lib/cn";

/* ============================ Browser ============================ */
export interface MockupBrowserProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adres in de balk. */
  url?: string;
  /** Verbergt de drie knopjes linksboven. */
  hideDots?: boolean;
  /** Donkere chroom, ook in lichte modus. */
  dark?: boolean;
}

/** MockupBrowser — een schermafbeelding in een browservenster zetten. */
export const MockupBrowser = React.forwardRef<HTMLDivElement, MockupBrowserProps>(function MockupBrowser(
  { url, hideDots, dark, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-mockup", "lui-mockup-browser", dark && "lui-mockup-dark", className)} {...rest}>
      <div className="lui-mockup-bar">
        {!hideDots && <Dots />}
        {url !== undefined && (
          <span className="lui-mockup-url" title={url}>
            {url}
          </span>
        )}
      </div>
      <div className="lui-mockup-screen">{children}</div>
    </div>
  );
});

/* ============================ Window ============================ */
export interface MockupWindowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  hideDots?: boolean;
  dark?: boolean;
}

/** MockupWindow — venster met titelbalk, voor een desktop-app of dialoog. */
export const MockupWindow = React.forwardRef<HTMLDivElement, MockupWindowProps>(function MockupWindow(
  { title, hideDots, dark, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-mockup", "lui-mockup-window", dark && "lui-mockup-dark", className)} {...rest}>
      <div className="lui-mockup-bar">
        {!hideDots && <Dots />}
        {title && <span className="lui-mockup-title">{title}</span>}
      </div>
      <div className="lui-mockup-screen">{children}</div>
    </div>
  );
});

/* ============================ Phone ============================ */
export interface MockupPhoneProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Breedte van het toestel in px; alles erin schaalt mee. */
  width?: number;
  /** Verhouding hoogte/breedte. Standaard 19.5:9, zoals een moderne telefoon. */
  ratio?: number;
  /** "island" is de pil, "notch" de bredere inkeping, "none" laat het weg. */
  top?: "island" | "notch" | "none";
  /** Statusbalk met tijd, signaal, wifi en batterij. Geef eigen inhoud mee of false. */
  statusBar?: boolean | React.ReactNode;
  /** Tijd links in de statusbalk. */
  time?: string;
  /** Streepje onderaan voor het vegen. */
  homeBar?: boolean;
  /** Kleur van de metalen rand, bijvoorbeeld "#ff8938". */
  frameColor?: string;
  /**
   * Achtergrond van het hele scherm — kleur of verloop. Zonder dit volgt het
   * scherm het thema van de site (var(--surface)).
   */
  screen?: string;
  /** Afbeelding als achtergrond, bijvoorbeeld een wallpaper of een screenshot. */
  wallpaper?: string;
  /**
   * Kleur van de statusbalk en het veegstreepje. "auto" leidt dat af uit de
   * schermachtergrond: bij een donkere achtergrond wordt alles wit.
   */
  screenTone?: "auto" | "light" | "dark";
  /** Zijknoppen (stil, volume, aan/uit) tonen. Standaard uit. */
  buttons?: boolean;
}

/** MockupPhone — een schermontwerp in een telefoonframe. */
export const MockupPhone = React.forwardRef<HTMLDivElement, MockupPhoneProps>(function MockupPhone(
  {
    width = 280,
    ratio = 19.5 / 9,
    top = "island",
    statusBar = true,
    time = "9:41",
    homeBar = true,
    frameColor,
    screen,
    wallpaper,
    screenTone = "auto",
    buttons = false,
    className,
    children,
    style,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-mockup-phone", className)}
      style={
        {
          "--lui-phone-w": `${width}px`,
          ...(frameColor ? { "--lui-phone-ring": frameColor } : {}),
          ...(screen ? { "--lui-phone-screen": screen } : {}),
          ...(wallpaper ? { "--lui-phone-wallpaper": `url("${wallpaper}")` } : {}),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div className="lui-mockup-phone-frame" style={{ aspectRatio: `1 / ${ratio}` }}>
        {buttons && (
          <>
            <span className="lui-mockup-phone-btn lui-mockup-phone-silent" aria-hidden="true" />
            <span className="lui-mockup-phone-btn lui-mockup-phone-vol-up" aria-hidden="true" />
            <span className="lui-mockup-phone-btn lui-mockup-phone-vol-down" aria-hidden="true" />
            <span className="lui-mockup-phone-btn lui-mockup-phone-power" aria-hidden="true" />
          </>
        )}

        <div className="lui-mockup-phone-screen" data-top={top} data-tone={tone(screenTone, screen, wallpaper)}>
          {(statusBar !== false || top !== "none") && (
            <div className="lui-mockup-phone-status">
              {top !== "none" && <span className={cn("lui-mockup-phone-top", `lui-mockup-phone-${top}`)} />}
              {statusBar === true ? (
                <>
                  <span className="lui-mockup-phone-time">{time}</span>
                  <span className="lui-mockup-phone-icons" aria-hidden="true">
                    <Signaal />
                    <Wifi />
                    <Batterij />
                  </span>
                </>
              ) : (
                statusBar !== false && statusBar
              )}
            </div>
          )}

          <div className="lui-mockup-phone-content">{children}</div>

          {homeBar && <span className="lui-mockup-phone-home" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
});

/**
 * Bepaalt of de statusbalk licht of donker moet zijn. Bij "auto" kijken we naar
 * de opgegeven achtergrond: een wallpaper of een donkere kleur krijgt witte
 * tekst. Lukt het niet die kleur te lezen (verloop, var(), color-mix), dan
 * laten we het aan het thema over.
 */
function tone(
  keuze: "auto" | "light" | "dark",
  screen?: string,
  wallpaper?: string
): "light" | "dark" | undefined {
  if (keuze !== "auto") return keuze;
  if (wallpaper) return "dark";
  if (!screen) return undefined;
  const helderheid = luminantie(screen);
  if (helderheid === null) return undefined;
  return helderheid < 0.45 ? "dark" : "light";
}

/** Relatieve helderheid van #rgb, #rrggbb of rgb()/rgba(); anders null. */
function luminantie(kleur: string): number | null {
  const tekst = kleur.trim();
  let r: number;
  let g: number;
  let b: number;

  const hex = tekst.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  const rgb = tekst.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);

  if (hex) {
    const cijfers = hex[1];
    const breed = cijfers.length === 3 ? cijfers.replace(/./g, (c) => c + c) : cijfers;
    r = parseInt(breed.slice(0, 2), 16);
    g = parseInt(breed.slice(2, 4), 16);
    b = parseInt(breed.slice(4, 6), 16);
  } else if (rgb) {
    r = Number(rgb[1]);
    g = Number(rgb[2]);
    b = Number(rgb[3]);
  } else {
    return null;
  }

  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/* De statusbalk-icoontjes zijn hier getekend; de icon set van de library
   bevat geen signaal-, wifi- of batterijsymbool. */
function Signaal() {
  return (
    <svg viewBox="0 0 18 12" width="17" height="11" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0.5" width="3" height="11.5" rx="1" opacity=".35" />
    </svg>
  );
}

function Wifi() {
  return (
    <svg viewBox="0 0 16 12" width="15" height="11" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1 4.2a10 10 0 0 1 14 0" strokeLinecap="round" />
      <path d="M3.6 6.9a6.4 6.4 0 0 1 8.8 0" strokeLinecap="round" />
      <path d="M6.2 9.5a2.7 2.7 0 0 1 3.6 0" strokeLinecap="round" />
    </svg>
  );
}

function Batterij() {
  return (
    <svg viewBox="0 0 26 12" width="24" height="11" fill="none">
      <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" stroke="currentColor" strokeOpacity=".45" />
      <rect x="2.4" y="2.4" width="13" height="7.2" rx="1.8" fill="currentColor" />
      <path d="M23.4 4.2v3.6a2.2 2.2 0 0 0 0-3.6z" fill="currentColor" fillOpacity=".45" />
    </svg>
  );
}

function Dots() {
  return (
    <span className="lui-mockup-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
