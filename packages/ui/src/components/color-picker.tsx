"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

/* ------------------------------ kleurwiskunde ------------------------------ */

interface Hsv {
  h: number;
  s: number;
  v: number;
}

/** Klemt een getal tussen min en max. */
const klem = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Zet HSV (h 0-360, s/v 0-1) om naar {r,g,b} met 0-255. */
function hsvNaarRgb({ h, s, v }: Hsv) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const sector = Math.floor(h / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][sector < 0 ? sector + 6 : sector];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** Zet {r,g,b} 0-255 om naar HSV. */
function rgbNaarHsv(r: number, g: number, b: number): Hsv {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = 60 * (((gg - bb) / d) % 6);
    else if (max === gg) h = 60 * ((bb - rr) / d + 2);
    else h = 60 * ((rr - gg) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

const naarHex2 = (n: number) => klem(Math.round(n), 0, 255).toString(16).padStart(2, "0");

/** Bouwt "#rrggbb" of "#rrggbbaa" wanneer alpha kleiner is dan 1. */
function hsvNaarHex(hsv: Hsv, alpha = 1) {
  const { r, g, b } = hsvNaarRgb(hsv);
  const basis = `#${naarHex2(r)}${naarHex2(g)}${naarHex2(b)}`;
  return alpha >= 1 ? basis : `${basis}${naarHex2(alpha * 255)}`;
}

/** Leest "#rgb", "#rgba", "#rrggbb" of "#rrggbbaa". Geeft null bij onzin. */
function hexNaarHsva(hex: string): { hsv: Hsv; a: number } | null {
  let h = hex.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3,4}$/i.test(h)) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { hsv: rgbNaarHsv(r, g, b), a };
}

/** Publieke helper: zet een hexkleur om naar "rgb(...)" of "rgba(...)". */
export function hexToRgbString(hex: string): string | null {
  const gelezen = hexNaarHsva(hex);
  if (!gelezen) return null;
  const { r, g, b } = hsvNaarRgb(gelezen.hsv);
  return gelezen.a >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${gelezen.a.toFixed(2)})`;
}

/* --------------------------------- sleep --------------------------------- */

/** Volgt pointer-drag binnen een element en geeft posities van 0 tot 1 terug. */
function useSleep(
  ref: React.RefObject<HTMLElement | null>,
  onVerplaats: (x: number, y: number) => void,
  disabled?: boolean
) {
  const bewaar = React.useRef(onVerplaats);
  bewaar.current = onVerplaats;

  return React.useCallback(
    (event: React.PointerEvent) => {
      if (disabled || event.button !== 0) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const meet = (clientX: number, clientY: number) =>
        bewaar.current(
          klem((clientX - rect.left) / rect.width, 0, 1),
          klem((clientY - rect.top) / rect.height, 0, 1)
        );
      el.setPointerCapture(event.pointerId);
      meet(event.clientX, event.clientY);
      const beweeg = (e: PointerEvent) => meet(e.clientX, e.clientY);
      const stop = () => {
        el.removeEventListener("pointermove", beweeg);
        el.removeEventListener("pointerup", stop);
        el.removeEventListener("pointercancel", stop);
      };
      el.addEventListener("pointermove", beweeg);
      el.addEventListener("pointerup", stop);
      el.addEventListener("pointercancel", stop);
    },
    [ref, disabled]
  );
}

/* ------------------------------- component ------------------------------- */

export const COLOR_PICKER_PRESETS = [
  "#0f172a",
  "#475569",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#ffffff",
];

export interface ColorPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Hexkleur, bv. "#3b82f6" of "#3b82f680" met alpha. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Extra schuif voor doorzichtigheid. */
  alpha?: boolean;
  /** Vaste kleuren onderaan. Geef een lege array om ze te verbergen. */
  presets?: string[];
  /** Hexveld verbergen. */
  hideInput?: boolean;
  /** Pipetknop tonen wanneer de browser EyeDropper ondersteunt. */
  eyeDropper?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Toegankelijke naam voor het kleurvlak. */
  label?: string;
}

/**
 * ColorPicker — kleurvlak met tint- en alphaschuif, hexveld en vaste kleuren.
 * Werkt met muis, touch en toetsenbord: pijltjes verplaatsen de greep, Shift
 * maakt grotere stappen, Home en End springen naar de uitersten.
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  function ColorPicker(
    {
      value,
      defaultValue = "#3b82f6",
      onValueChange,
      alpha = false,
      presets = COLOR_PICKER_PRESETS,
      hideInput,
      eyeDropper = true,
      size = "md",
      disabled,
      label = "Kleur",
      className,
      ...props
    },
    ref
  ) {
    const [hex, setHex] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    });

    const gelezen = React.useMemo(() => hexNaarHsva(hex ?? "") ?? { hsv: { h: 217, s: 0.76, v: 0.96 }, a: 1 }, [hex]);

    /* Tint en verzadiging apart bijhouden: bij zwart of wit gaat de tint anders
       verloren zodra je de greep naar een rand sleept. */
    const [hsv, setHsv] = React.useState<Hsv>(gelezen.hsv);
    const laatste = React.useRef(hex);
    if (laatste.current !== hex) {
      laatste.current = hex;
      const nieuw = hexNaarHsva(hex ?? "");
      if (nieuw && hsvNaarHex(hsv, gelezen.a).toLowerCase() !== (hex ?? "").toLowerCase()) {
        if (nieuw.hsv.s > 0 && nieuw.hsv.v > 0) setHsv(nieuw.hsv);
        else setHsv((v) => ({ h: v.h, s: nieuw.hsv.s, v: nieuw.hsv.v }));
      }
    }

    const a = gelezen.a;
    const zet = (volgende: Hsv, alphaWaarde = a) => {
      setHsv(volgende);
      setHex(hsvNaarHex(volgende, alpha ? alphaWaarde : 1));
    };

    const vlak = React.useRef<HTMLDivElement>(null);
    const opVlak = useSleep(
      vlak,
      (x, y) => zet({ h: hsv.h, s: x, v: 1 - y }),
      disabled
    );

    const tintBalk = React.useRef<HTMLDivElement>(null);
    const opTint = useSleep(tintBalk, (x) => zet({ ...hsv, h: x * 360 }), disabled);

    const alphaBalk = React.useRef<HTMLDivElement>(null);
    const opAlpha = useSleep(alphaBalk, (x) => zet(hsv, x), disabled);

    /* Toetsenbord op het kleurvlak. */
    const vlakToets = (e: React.KeyboardEvent) => {
      if (disabled) return;
      const stap = e.shiftKey ? 0.1 : 0.02;
      const acties: Record<string, () => void> = {
        ArrowRight: () => zet({ ...hsv, s: klem(hsv.s + stap, 0, 1) }),
        ArrowLeft: () => zet({ ...hsv, s: klem(hsv.s - stap, 0, 1) }),
        ArrowUp: () => zet({ ...hsv, v: klem(hsv.v + stap, 0, 1) }),
        ArrowDown: () => zet({ ...hsv, v: klem(hsv.v - stap, 0, 1) }),
        Home: () => zet({ ...hsv, s: 0, v: 1 }),
        End: () => zet({ ...hsv, s: 1, v: 1 }),
      };
      const actie = acties[e.key];
      if (actie) {
        e.preventDefault();
        actie();
      }
    };

    const balkToets = (e: React.KeyboardEvent, soort: "hue" | "alpha") => {
      if (disabled) return;
      const groot = e.shiftKey;
      const stap = soort === "hue" ? (groot ? 30 : 2) : groot ? 0.1 : 0.02;
      const huidig = soort === "hue" ? hsv.h : a;
      const max = soort === "hue" ? 360 : 1;
      let volgende: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") volgende = klem(huidig + stap, 0, max);
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") volgende = klem(huidig - stap, 0, max);
      if (e.key === "Home") volgende = 0;
      if (e.key === "End") volgende = max;
      if (volgende === null) return;
      e.preventDefault();
      if (soort === "hue") zet({ ...hsv, h: volgende });
      else zet(hsv, volgende);
    };

    /* Hexveld: tijdens het typen vrij laten, pas overnemen als het klopt. */
    const [tekst, setTekst] = React.useState<string | null>(null);
    const veldWaarde = tekst ?? (hex ?? "").toUpperCase();
    const veldWijzig = (ruw: string) => {
      setTekst(ruw);
      const gelezenVeld = hexNaarHsva(ruw);
      if (!gelezenVeld) return;
      setHsv(
        gelezenVeld.hsv.s > 0 && gelezenVeld.hsv.v > 0
          ? gelezenVeld.hsv
          : { ...hsv, s: gelezenVeld.hsv.s, v: gelezenVeld.hsv.v }
      );
      setHex(hsvNaarHex(gelezenVeld.hsv, alpha ? gelezenVeld.a : 1));
    };

    const [heeftPipet, setHeeftPipet] = React.useState(false);
    React.useEffect(() => {
      setHeeftPipet(typeof window !== "undefined" && "EyeDropper" in window);
    }, []);

    const pipet = async () => {
      try {
        const Dropper = (window as unknown as { EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
        const resultaat = await new Dropper().open();
        const gekozen = hexNaarHsva(resultaat.sRGBHex);
        if (gekozen) zet(gekozen.hsv, a);
      } catch {
        /* geannuleerd */
      }
    };

    const tintKleur = hsvNaarHex({ h: hsv.h, s: 1, v: 1 });
    const vol = hsvNaarHex(hsv, 1);

    return (
      <div
        ref={ref}
        className={cn("lui-colorpicker", `lui-colorpicker-${size}`, className)}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        <div
          ref={vlak}
          className="lui-colorpicker-area"
          style={{ background: tintKleur }}
          onPointerDown={opVlak}
          onKeyDown={vlakToets}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-valuetext={`${hex}`}
          aria-disabled={disabled || undefined}
        >
          <span className="lui-colorpicker-white" />
          <span className="lui-colorpicker-black" />
          <span
            className="lui-colorpicker-thumb"
            style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: vol }}
          />
        </div>

        <div className="lui-colorpicker-rows">
          <span className="lui-colorpicker-preview" style={{ ["--lui-cp-color" as string]: hex }} />
          <div className="lui-colorpicker-sliders">
            <div
              ref={tintBalk}
              className="lui-colorpicker-bar lui-colorpicker-hue"
              onPointerDown={opTint}
              onKeyDown={(e) => balkToets(e, "hue")}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label="Tint"
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={Math.round(hsv.h)}
              aria-disabled={disabled || undefined}
            >
              <span className="lui-colorpicker-bar-thumb" style={{ left: `${(hsv.h / 360) * 100}%`, background: tintKleur }} />
            </div>
            {alpha ? (
              <div
                ref={alphaBalk}
                className="lui-colorpicker-bar lui-colorpicker-alpha"
                style={{ ["--lui-cp-solid" as string]: vol }}
                onPointerDown={opAlpha}
                onKeyDown={(e) => balkToets(e, "alpha")}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label="Doorzichtigheid"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(a * 100)}
                aria-disabled={disabled || undefined}
              >
                <span className="lui-colorpicker-bar-thumb" style={{ left: `${a * 100}%`, background: hex }} />
              </div>
            ) : null}
          </div>
        </div>

        {hideInput && !(eyeDropper && heeftPipet) ? null : (
          <div className="lui-colorpicker-foot">
            {hideInput ? null : (
              <input
                className="lui-colorpicker-input"
                value={veldWaarde}
                onChange={(e) => veldWijzig(e.target.value)}
                onBlur={() => setTekst(null)}
                spellCheck={false}
                autoComplete="off"
                disabled={disabled}
                aria-label="Hexkleur"
              />
            )}
            {eyeDropper && heeftPipet ? (
              <button
                type="button"
                className="lui-colorpicker-pipet"
                onClick={pipet}
                disabled={disabled}
                aria-label="Kleur van het scherm kiezen"
              >
                <Icon name="pipette" size={16} />
              </button>
            ) : null}
          </div>
        )}

        {presets.length ? (
          <div className="lui-colorpicker-presets" role="group" aria-label="Vaste kleuren">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                className="lui-colorpicker-preset"
                style={{ ["--lui-cp-color" as string]: preset }}
                data-active={(hex ?? "").toLowerCase() === preset.toLowerCase() ? "" : undefined}
                onClick={() => {
                  const gekozen = hexNaarHsva(preset);
                  if (gekozen) zet(gekozen.hsv, gekozen.a);
                }}
                disabled={disabled}
                aria-label={preset}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }
);
