"use client";
import * as React from "react";
import { cn } from "../lib/cn";

/** Ruimte tussen de kinderen; volgt dezelfde schaal als de rest van de library. */
export type Gap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type LayoutAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type LayoutJustify = "start" | "center" | "end" | "between" | "around";

interface GemeenschappelijkeProps {
  gap?: Gap;
  align?: LayoutAlign;
  justify?: LayoutJustify;
  /** Rendert een ander element, bv. "section" of "ul". */
  as?: React.ElementType;
}

export interface ContainerProps extends React.HTMLAttributes<HTMLElement>, GemeenschappelijkeProps {
  /** Maximale breedte; "full" laat de container meegroeien. */
  size?: "sm" | "md" | "lg" | "full";
  /** Binnenmarge links en rechts. */
  padded?: boolean;
}

export interface StackProps extends React.HTMLAttributes<HTMLElement>, GemeenschappelijkeProps {
  /** Scheidingslijn tussen de kinderen. */
  divided?: boolean;
}

export interface RowProps extends React.HTMLAttributes<HTMLElement>, GemeenschappelijkeProps {
  /** Laat de kinderen afbreken naar een volgende regel. */
  wrap?: boolean;
}

export interface GridProps extends React.HTMLAttributes<HTMLElement>, GemeenschappelijkeProps {
  /** Vast aantal kolommen; laat weg voor kolommen die zich vanzelf schikken. */
  cols?: number;
  /** Minimumbreedte per kolom wanneer `cols` niet gezet is. */
  min?: number;
}

export interface SpacerProps extends React.HTMLAttributes<HTMLElement> {
  /** Vaste hoogte of breedte in pixels; zonder waarde duwt de Spacer de rest uit elkaar. */
  size?: number;
  /** Horizontale ruimte in plaats van verticale. */
  horizontal?: boolean;
}

const data = (props: GemeenschappelijkeProps) => ({
  "data-gap": props.gap,
  "data-align": props.align,
  "data-justify": props.justify,
});

/** Container — houdt je inhoud op leesbare breedte en centreert ze. */
export const Container = React.forwardRef<HTMLElement, ContainerProps>(function Container(
  { size = "md", padded = true, gap, align, justify, as: Comp = "div", className, ...rest },
  ref
) {
  return (
    <Comp
      ref={ref}
      data-size={size}
      data-padded={padded ? "" : undefined}
      {...data({ gap, align, justify })}
      className={cn("lui-container", className)}
      {...rest}
    />
  );
});

/** Stack — kinderen onder elkaar, met één afstand tussen alles. */
export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  { gap = "md", align, justify, divided, as: Comp = "div", className, ...rest },
  ref
) {
  return (
    <Comp
      ref={ref}
      data-divided={divided ? "" : undefined}
      {...data({ gap, align, justify })}
      className={cn("lui-stack", className)}
      {...rest}
    />
  );
});

/**
 * Row — kinderen naast elkaar, standaard verticaal gecentreerd.
 *
 * De klasse heet `lui-hstack` en niet `lui-row`: die laatste is van ListRow,
 * en twee componenten op dezelfde klasse overschrijven elkaars opmaak.
 */
export const Row = React.forwardRef<HTMLElement, RowProps>(function Row(
  { gap = "sm", align = "center", justify, wrap = true, as: Comp = "div", className, ...rest },
  ref
) {
  return (
    <Comp
      ref={ref}
      data-wrap={wrap ? "" : undefined}
      {...data({ gap, align, justify })}
      className={cn("lui-hstack", className)}
      {...rest}
    />
  );
});

/** Grid — kolommen die zich vanzelf schikken, of een vast aantal. */
export const Grid = React.forwardRef<HTMLElement, GridProps>(function Grid(
  { cols, min = 220, gap = "md", align, justify, as: Comp = "div", className, style, ...rest },
  ref
) {
  return (
    <Comp
      ref={ref}
      {...data({ gap, align, justify })}
      className={cn("lui-grid", className)}
      style={
        {
          "--lui-grid-cols": cols ? `repeat(${cols}, minmax(0, 1fr))` : undefined,
          "--lui-grid-min": `${min}px`,
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});

/** Spacer — duwt wat erna komt weg, of houdt een vaste ruimte vrij. */
export const Spacer = React.forwardRef<HTMLSpanElement, SpacerProps>(function Spacer(
  { size, horizontal, className, style, ...rest },
  ref
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn("lui-spacer", className)}
      style={{
        flex: size === undefined ? 1 : "none",
        width: horizontal ? size : undefined,
        height: horizontal ? undefined : size,
        ...style,
      }}
      {...rest}
    />
  );
});
