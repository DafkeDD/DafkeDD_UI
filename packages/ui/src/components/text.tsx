"use client";
import * as React from "react";
import { variants } from "../lib/variants";

const text = variants({
  base: "lui-text",
  variants: {
    variant: {
      display: "lui-display",
      h1: "lui-h1",
      h2: "lui-h2",
      h3: "lui-h3",
      body: "",
      small: "lui-text-sm",
      caption: "lui-text-caption",
      eyebrow: "lui-eyebrow",
      mono: "lui-mono lui-text-sm",
    },
    tone: {
      default: "",
      muted: "lui-text-muted",
      subtle: "lui-text-subtle",
      accent: "lui-text-accent",
      green: "lui-text-green",
      amber: "lui-text-amber",
      red: "lui-text-red",
      inverse: "lui-text-inverse",
    },
    weight: { regular: "", medium: "lui-text-medium", semibold: "lui-text-semibold", bold: "lui-text-bold" },
    align: { left: "", center: "lui-text-center", right: "lui-text-right" },
    truncate: { true: "lui-text-truncate", false: "" },
  },
  defaultVariants: { variant: "body", tone: "default", weight: "regular", align: "left", truncate: false },
});

export type TextVariant =
  | "display" | "h1" | "h2" | "h3" | "body" | "small" | "caption" | "eyebrow" | "mono";
export type TextTone =
  | "default" | "muted" | "subtle" | "accent" | "green" | "amber" | "red" | "inverse";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Grootte en gewicht; kiest ook een passend element als je `as` weglaat. */
  variant?: TextVariant;
  tone?: TextTone;
  weight?: "regular" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
  /** Kapt één regel af met drie puntjes. */
  truncate?: boolean;
  /** Kapt af na zoveel regels; overschrijft `truncate`. */
  lines?: number;
  /** Eigen element, bv. "span", "label" of "h2". */
  as?: React.ElementType;
}

const ELEMENT: Record<TextVariant, React.ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  small: "p",
  caption: "span",
  eyebrow: "span",
  mono: "span",
};

/**
 * Text — één component voor alle tekst: kopregels, lopende tekst, bijschriften
 * en cijfers. Kleuren en maten komen uit de tokens, dus nooit een los font-size
 * in je markup.
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(
  { variant = "body", tone, weight, align, truncate, lines, as, className, style, ...rest },
  ref
) {
  const Comp = (as ?? ELEMENT[variant]) as React.ElementType;

  return (
    <Comp
      ref={ref}
      className={text({ variant, tone, weight, align, truncate: truncate && !lines, className })}
      style={
        lines
          ? ({
              display: "-webkit-box",
              WebkitLineClamp: lines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              ...style,
            } as React.CSSProperties)
          : style
      }
      {...rest}
    />
  );
});
