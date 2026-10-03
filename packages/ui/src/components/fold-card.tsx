"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface FoldCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Wat er op de dichte klep staat. */
  cover: React.ReactNode;
  /** Wat eronder tevoorschijn komt. */
  children?: React.ReactNode;
  /** Opent bij hover (standaard) of pas bij een klik. */
  trigger?: "hover" | "click";
  /** Welke kant de klep opendraait. */
  side?: "left" | "right" | "top";
  /** Hoe ver de klep opendraait, in graden. */
  angle?: number;
  /** Diepte van het perspectief in pixels; lager oogt sterker. */
  perspective?: number;
  /** Verhouding van de kaart, bv. 3 / 4. */
  aspectRatio?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Toegankelijke naam, bv. "Ontdek meer". */
  label?: string;
  /** Opmaak van de klep zelf, bv. een verloop of een achtergrondafbeelding. */
  coverStyle?: React.CSSProperties;
  /** Opmaak van het vlak eronder. */
  insideStyle?: React.CSSProperties;
}

/**
 * FoldCard — kaart met een klep die opendraait en de inhoud eronder toont.
 * Werkt met een 3D-transform op de klep; de inhoud eronder blijft gewoon
 * tekst, dus ze is leesbaar en selecteerbaar zodra de kaart open is.
 */
export const FoldCard = React.forwardRef<HTMLDivElement, FoldCardProps>(function FoldCard(
  {
    cover,
    children,
    trigger = "hover",
    side = "left",
    angle = 105,
    perspective = 1400,
    aspectRatio = 3 / 4,
    open,
    defaultOpen,
    onOpenChange,
    label = "Openvouwen",
    coverStyle,
    insideStyle,
    className,
    style,
    ...rest
  },
  ref
) {
  const [intern, setIntern] = React.useState(defaultOpen ?? false);
  const uit = open ?? intern;

  const zet = (waarde: boolean) => {
    if (open === undefined) setIntern(waarde);
    onOpenChange?.(waarde);
  };

  /* Bij hover openen we op muis en focus; bij klik alleen op klik en Enter. */
  const opHover = trigger === "hover";

  return (
    <div
      ref={ref}
      className={cn("lui-foldcard", className)}
      data-open={uit ? "" : undefined}
      data-side={side}
      style={{
        ...style,
        aspectRatio: String(aspectRatio),
        ["--lui-fold-angle" as string]: `${angle}deg`,
        ["--lui-fold-perspective" as string]: `${perspective}px`,
      }}
      onMouseEnter={opHover ? () => zet(true) : undefined}
      onMouseLeave={opHover ? () => zet(false) : undefined}
      {...rest}
    >
      <div className="lui-foldcard-inside" style={insideStyle}>{children}</div>

      <button
        type="button"
        className="lui-foldcard-cover"
        style={coverStyle}
        aria-expanded={uit}
        aria-label={label}
        onClick={opHover ? undefined : () => zet(!uit)}
        onFocus={opHover ? () => zet(true) : undefined}
        onBlur={opHover ? () => zet(false) : undefined}
        /* Dicht is de klep de knop; open mag ze de inhoud niet blokkeren. */
        tabIndex={uit && opHover ? -1 : 0}
      >
        <span className="lui-foldcard-cover-inner">{cover}</span>
      </button>
    </div>
  );
});
