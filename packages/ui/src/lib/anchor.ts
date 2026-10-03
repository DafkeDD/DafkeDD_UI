"use client";
/**
 * Positionering voor zwevende lagen (dropdown, popover, select, tooltip,
 * combobox). Eigen implementatie — geen Floating UI / Popper.
 *
 * Ondersteunt: side + align, offset, automatische flip bij te weinig ruimte,
 * clampen binnen de viewport, breedte gelijk aan de anchor, en herberekenen
 * bij scroll/resize.
 */
import * as React from "react";
import { useIsoLayoutEffect } from "./hooks";

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";

export interface AnchorOptions {
  side?: Side;
  align?: Align;
  /** Afstand tussen anchor en laag, in px. */
  offset?: number;
  /** Minimale marge tot de rand van het scherm. */
  padding?: number;
  /** Laag krijgt exact de breedte van de anchor (select, combobox). */
  matchWidth?: boolean;
  /** Laag krijgt minimaal de breedte van de anchor. */
  minWidth?: boolean;
}

export interface AnchorPosition {
  style: React.CSSProperties;
  side: Side;
  align: Align;
  ready: boolean;
}

export function useAnchorPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  floatingRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  options: AnchorOptions = {}
): AnchorPosition {
  const {
    side = "bottom",
    align = "start",
    offset = 6,
    padding = 8,
    matchWidth = false,
    minWidth = false,
  } = options;

  const [position, setPosition] = React.useState<AnchorPosition>({
    style: { position: "fixed", top: 0, left: 0, opacity: 0, visibility: "hidden" },
    side,
    align,
    ready: false,
  });

  const compute = React.useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;

    const a = anchor.getBoundingClientRect();
    const f = floating.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    const space = {
      top: a.top - padding,
      bottom: vh - a.bottom - padding,
      left: a.left - padding,
      right: vw - a.right - padding,
    };

    // Flip wanneer er aan de gewenste kant te weinig ruimte is.
    let usedSide: Side = side;
    const needed = side === "top" || side === "bottom" ? f.height + offset : f.width + offset;
    if (space[side] < needed) {
      const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
      if (space[opposite[side]] > space[side]) usedSide = opposite[side];
    }

    const width = matchWidth ? a.width : minWidth ? Math.max(a.width, f.width) : f.width;

    let left = 0;
    let top = 0;

    if (usedSide === "bottom" || usedSide === "top") {
      top = usedSide === "bottom" ? a.bottom + offset : a.top - offset - f.height;
      left =
        align === "start" ? a.left : align === "end" ? a.right - width : a.left + a.width / 2 - width / 2;
    } else {
      left = usedSide === "right" ? a.right + offset : a.left - offset - width;
      top =
        align === "start" ? a.top : align === "end" ? a.bottom - f.height : a.top + a.height / 2 - f.height / 2;
    }

    // Binnen beeld houden.
    left = clamp(left, padding, Math.max(padding, vw - width - padding));
    top = clamp(top, padding, Math.max(padding, vh - f.height - padding));

    // Maximale hoogte zodat lange menu's kunnen scrollen in plaats van afgesneden worden.
    const maxHeight =
      usedSide === "bottom"
        ? Math.max(120, vh - (a.bottom + offset) - padding)
        : usedSide === "top"
          ? Math.max(120, a.top - offset - padding)
          : Math.max(120, vh - 2 * padding);

    setPosition({
      style: {
        position: "fixed",
        visibility: "visible",
        top: Math.round(top),
        left: Math.round(left),
        ...(matchWidth || minWidth ? { [matchWidth ? "width" : "minWidth"]: Math.round(width) } : {}),
        maxHeight: Math.round(maxHeight),
      },
      side: usedSide,
      align,
      ready: true,
    });
  }, [anchorRef, floatingRef, side, align, offset, padding, matchWidth, minWidth]);

  useIsoLayoutEffect(() => {
    if (!open) {
      setPosition((p) => ({
        ...p,
        ready: false,
        style: { ...p.style, opacity: 0, visibility: "hidden" },
      }));
      return;
    }

    // De zwevende laag zit in een portal en is soms pas een frame later
    // gemonteerd; daarom proberen we het opnieuw tot beide elementen bestaan.
    const onChange = () => compute();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onChange) : null;

    let frame = 0;
    let attempts = 0;
    const attach = () => {
      if (anchorRef.current && floatingRef.current) {
        compute();
        observer?.observe(floatingRef.current);
        observer?.observe(anchorRef.current);
        return;
      }
      if (attempts < 20) {
        attempts += 1;
        frame = requestAnimationFrame(attach);
      }
    };
    attach();

    window.addEventListener("scroll", onChange, true);
    window.addEventListener("resize", onChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("resize", onChange);
      observer?.disconnect();
    };
  }, [open, compute, anchorRef, floatingRef]);

  return position;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
