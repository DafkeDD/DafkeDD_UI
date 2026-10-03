"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface ConfettiBurstProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Aantal snippers. */
  count?: number;
  /** Kleuren; standaard de accent- en statuskleuren van het thema. */
  colors?: string[];
  /** Hoe ver de snippers vliegen, in pixels. */
  spread?: number;
  duration?: number;
  /** Wordt aangeroepen wanneer de animatie klaar is. */
  onDone?: () => void;
}

const DEFAULT_COLORS = [
  "var(--accent)",
  "var(--amber)",
  "var(--green)",
  "var(--blue)",
  "var(--violet)",
  "var(--red)",
];

/**
 * ConfettiBurst — kleine explosie van snippers, bijvoorbeeld bij het afvinken
 * van een taak. Rendert één keer en ruimt zichzelf op.
 */
export const ConfettiBurst = React.forwardRef<HTMLSpanElement, ConfettiBurstProps>(
  function ConfettiBurst(
    { count = 14, colors = DEFAULT_COLORS, spread = 42, duration = 700, className, onDone, ...rest },
    ref
  ) {
    const host = React.useRef<HTMLSpanElement | null>(null);
    const doneRef = React.useRef(onDone);
    doneRef.current = onDone;

    React.useEffect(() => {
      const node = host.current;
      if (!node) return;

      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        doneRef.current?.();
        return;
      }

      for (let index = 0; index < count; index += 1) {
        const piece = document.createElement("i");
        const size = 5 + Math.random() * 4;
        piece.style.cssText = [
          "position:absolute",
          "left:0",
          "top:0",
          `width:${size}px`,
          `height:${size}px`,
          "border-radius:2px",
          `background:${colors[index % colors.length]}`,
        ].join(";");
        node.appendChild(piece);

        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.5;
        const distance = spread * 0.6 + Math.random() * spread;
        piece.animate(
          [
            { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
            {
              transform: `translate(${Math.cos(angle) * distance}px, ${
                Math.sin(angle) * distance - 14
              }px) scale(.4) rotate(${Math.random() * 360}deg)`,
              opacity: 0,
            },
          ],
          { duration: duration + Math.random() * 300, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
        );
      }

      const timer = window.setTimeout(() => {
        node.replaceChildren();
        doneRef.current?.();
      }, duration + 400);

      return () => {
        window.clearTimeout(timer);
        node.replaceChildren();
      };
    }, [count, colors, spread, duration]);

    return (
      <span
        ref={(node) => {
          host.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
        }}
        aria-hidden="true"
        className={cn("lui-confetti", className)}
        {...rest}
      />
    );
  }
);
