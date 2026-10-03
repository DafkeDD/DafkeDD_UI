"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { encodeQr, type QrErrorLevel } from "./qr-encode";

export interface QrCodeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** De inhoud van de code: URL, otpauth-string, tekst … */
  value: string;
  /** Foutcorrectie: L ~7%, M ~15%, Q ~25%, H ~30%. Hoger = meer modules. */
  level?: QrErrorLevel;
  /** Breedte en hoogte in pixels. */
  size?: number;
  /** Stille zone rondom, in modules. Scanners hebben er minstens 4 nodig. */
  quietZone?: number;
  /** Vast maskerpatroon 0-7; standaard kiest de encoder het rustigste. */
  mask?: number;
  /** Tekst onder de code. */
  caption?: React.ReactNode;
  /** Beschrijving voor schermlezers. Standaard de waarde zelf. */
  label?: string;
  /** Rondom een kader en witte achtergrond (standaard aan). */
  framed?: boolean;
}

/** QrCode — echte, scanbare QR-code. Byte-modus, versie 1 t/m 10. */
export const QrCode = React.forwardRef<HTMLDivElement, QrCodeProps>(function QrCode(
  { value, level = "M", size = 160, quietZone = 4, mask, caption, label, framed = true, className, style, ...rest },
  ref
) {
  const result = React.useMemo(() => {
    try {
      return { ok: true as const, data: encodeQr(value, { level, mask }) };
    } catch (error) {
      return { ok: false as const, message: error instanceof Error ? error.message : String(error) };
    }
  }, [value, level, mask]);

  if (!result.ok) {
    return (
      <div
        ref={ref}
        className={cn("lui-qr", "lui-qr-error", className)}
        style={{ width: size, height: size, ...style }}
        title={result.message}
        role="img"
        aria-label={result.message}
        {...rest}
      />
    );
  }

  const { matrix, size: modules, version } = result.data;
  const span = modules + quietZone * 2;

  // Alle donkere modules in één pad — scheelt honderden losse rechthoeken.
  let path = "";
  for (let row = 0; row < modules; row += 1) {
    for (let column = 0; column < modules; column += 1) {
      if (matrix[row][column]) path += `M${column + quietZone} ${row + quietZone}h1v1h-1z`;
    }
  }

  return (
    <div
      ref={ref}
      className={cn("lui-qr", framed && "lui-qr-framed", className)}
      data-version={version}
      style={style}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${span} ${span}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={label ?? value}
      >
        <rect width={span} height={span} className="lui-qr-bg" />
        <path d={path} className="lui-qr-fg" />
      </svg>
      {caption && <div className="lui-qr-caption">{caption}</div>}
    </div>
  );
});

export { encodeQr, QR_MAX_VERSION } from "./qr-encode";
export type { QrErrorLevel, QrEncodeOptions, QrResult } from "./qr-encode";
