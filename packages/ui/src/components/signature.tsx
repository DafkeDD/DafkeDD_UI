"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

interface Punt {
  x: number;
  y: number;
}

export interface SignatureHandle {
  /** Alles wissen. */
  clear: () => void;
  /** Laatste haal ongedaan maken. */
  undo: () => void;
  /** Of er al iets getekend is. */
  isEmpty: () => boolean;
  /** De handtekening als data-URL, standaard PNG. */
  toDataURL: (type?: string, quality?: number) => string;
  /** De handtekening als bestand, bv. om te uploaden. */
  toBlob: (type?: string) => Promise<Blob | null>;
}

export interface SignatureProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Hoogte van het tekenvlak in pixels; de breedte volgt de container. */
  height?: number;
  /** Kleur van de inkt. */
  color?: string;
  /** Dikte van de lijn. */
  lineWidth?: number;
  /** Achtergrond van het vlak; "transparent" houdt de PNG doorzichtig. */
  background?: string;
  /** Aangeroepen na elke haal, met of er iets staat. */
  onChange?: (isEmpty: boolean) => void;
  /** Knoppenrij onder het vlak verbergen. */
  hideActions?: boolean;
  clearLabel?: string;
  undoLabel?: string;
  /** Streepje met "Handtekening" eronder. */
  guideLine?: boolean;
  guideLabel?: React.ReactNode;
  disabled?: boolean;
  label?: string;
}

/**
 * Signature — vlak om met muis, vinger of pen te tekenen. De lijn wordt
 * gladgetrokken met een midpoint-curve, zodat hij niet hoekig wordt bij
 * snelle halen.
 */
export const Signature = React.forwardRef<SignatureHandle, SignatureProps>(function Signature(
  {
    height = 180,
    color = "var(--text)",
    lineWidth = 2.2,
    background = "transparent",
    onChange,
    hideActions,
    clearLabel = "Wissen",
    undoLabel = "Ongedaan",
    guideLine = true,
    guideLabel = "Handtekening",
    disabled,
    label = "Handtekeningveld",
    className,
    ...rest
  },
  ref
) {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const wikkel = React.useRef<HTMLDivElement>(null);
  const halen = React.useRef<Punt[][]>([]);
  const huidige = React.useRef<Punt[] | null>(null);
  const [leeg, setLeeg] = React.useState(true);

  const melden = React.useRef(onChange);
  melden.current = onChange;

  /* Inkt uit een CSS-variabele moet eerst naar een echte kleur: canvas kent
     var() niet. */
  const inkt = React.useCallback(() => {
    const el = wikkel.current;
    if (!el || !color.startsWith("var(")) return color;
    const naam = color.slice(4, -1).trim();
    return getComputedStyle(el).getPropertyValue(naam).trim() || "#000";
  }, [color]);

  const tekenAlles = React.useCallback(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const schaal = window.devicePixelRatio || 1;

    ctx.setTransform(schaal, 0, 0, schaal, 0, 0);
    ctx.clearRect(0, 0, el.width / schaal, el.height / schaal);
    if (background !== "transparent") {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, el.width / schaal, el.height / schaal);
    }

    ctx.strokeStyle = inkt();
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (const haal of halen.current) {
      if (haal.length === 0) continue;
      ctx.beginPath();
      if (haal.length < 3) {
        ctx.moveTo(haal[0].x, haal[0].y);
        ctx.lineTo(haal[haal.length - 1].x, haal[haal.length - 1].y);
      } else {
        ctx.moveTo(haal[0].x, haal[0].y);
        /* Door telkens naar het midden tussen twee punten te krommen, loopt de
           lijn vloeiend door in plaats van per punt te knikken. */
        for (let i = 1; i < haal.length - 1; i += 1) {
          const midX = (haal[i].x + haal[i + 1].x) / 2;
          const midY = (haal[i].y + haal[i + 1].y) / 2;
          ctx.quadraticCurveTo(haal[i].x, haal[i].y, midX, midY);
        }
        ctx.lineTo(haal[haal.length - 1].x, haal[haal.length - 1].y);
      }
      ctx.stroke();
    }
  }, [background, inkt, lineWidth]);

  /* Het canvas op zijn echte pixelgrootte zetten, anders is de lijn wazig. */
  React.useEffect(() => {
    const el = canvas.current;
    const doos = wikkel.current;
    if (!el || !doos) return;

    const meet = () => {
      const schaal = window.devicePixelRatio || 1;
      el.width = doos.clientWidth * schaal;
      el.height = height * schaal;
      el.style.width = `${doos.clientWidth}px`;
      el.style.height = `${height}px`;
      tekenAlles();
    };

    meet();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", meet);
      return () => window.removeEventListener("resize", meet);
    }
    const waarnemer = new ResizeObserver(meet);
    waarnemer.observe(doos);
    return () => waarnemer.disconnect();
  }, [height, tekenAlles]);

  const puntVan = (event: React.PointerEvent): Punt => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const zetLeeg = () => {
    const nu = halen.current.length === 0;
    setLeeg(nu);
    melden.current?.(nu);
  };

  React.useImperativeHandle(ref, () => ({
    clear: () => {
      halen.current = [];
      tekenAlles();
      zetLeeg();
    },
    undo: () => {
      halen.current = halen.current.slice(0, -1);
      tekenAlles();
      zetLeeg();
    },
    isEmpty: () => halen.current.length === 0,
    toDataURL: (type = "image/png", quality) => canvas.current?.toDataURL(type, quality) ?? "",
    toBlob: (type = "image/png") =>
      new Promise((klaar) => {
        const el = canvas.current;
        if (!el) return klaar(null);
        el.toBlob((blob) => klaar(blob), type);
      }),
  }));

  return (
    <div ref={wikkel} className={cn("lui-signature", className)} data-disabled={disabled ? "" : undefined} {...rest}>
      <div className="lui-signature-pad" style={{ height }}>
        <canvas
          ref={canvas}
          className="lui-signature-canvas"
          role="img"
          aria-label={label}
          onPointerDown={(event) => {
            if (disabled) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            huidige.current = [puntVan(event)];
            halen.current = [...halen.current, huidige.current];
          }}
          onPointerMove={(event) => {
            if (!huidige.current) return;
            huidige.current.push(puntVan(event));
            tekenAlles();
          }}
          onPointerUp={() => {
            if (!huidige.current) return;
            huidige.current = null;
            zetLeeg();
          }}
          onPointerCancel={() => {
            huidige.current = null;
            zetLeeg();
          }}
        />
        {guideLine && (
          <div className="lui-signature-guide" aria-hidden="true">
            <span className="lui-signature-line" />
            {guideLabel && <span className="lui-signature-hint">{guideLabel}</span>}
          </div>
        )}
      </div>

      {!hideActions && (
        <div className="lui-signature-actions">
          <button
            type="button"
            className="lui-signature-btn"
            onClick={() => {
              halen.current = halen.current.slice(0, -1);
              tekenAlles();
              zetLeeg();
            }}
            disabled={disabled || leeg}
          >
            <Icon name="refresh" size={14} />
            {undoLabel}
          </button>
          <button
            type="button"
            className="lui-signature-btn"
            onClick={() => {
              halen.current = [];
              tekenAlles();
              zetLeeg();
            }}
            disabled={disabled || leeg}
          >
            <Icon name="trash" size={14} />
            {clearLabel}
          </button>
        </div>
      )}
    </div>
  );
});
