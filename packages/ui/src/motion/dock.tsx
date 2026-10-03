"use client";
import * as React from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "../lib/cn";

interface DockContextValue {
  muisX: ReturnType<typeof useMotionValue<number>>;
  grootte: number;
  vergroting: number;
  afstand: number;
  vertical: boolean;
}

const DockContext = React.createContext<DockContextValue | null>(null);

export interface DockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"> {
  /** Rustige grootte van een icoon in pixels. */
  size?: number;
  /** Grootte onder de muis. */
  magnification?: number;
  /** Binnen hoeveel pixels de vergroting begint. */
  distance?: number;
  vertical?: boolean;
}

/**
 * Dock — rij iconen die opzwelt onder de muis, zoals de dock van macOS.
 * De afstand tot de muis stuurt de grootte via een spring per item.
 */
export const Dock = React.forwardRef<HTMLDivElement, DockProps>(function Dock(
  { size = 42, magnification = 68, distance = 130, vertical, className, children, ...rest },
  ref
) {
  const muisX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <DockContext.Provider value={{ muisX, grootte: size, vergroting: magnification, afstand: distance, vertical: Boolean(vertical) }}>
      <motion.div
        ref={ref}
        className={cn("lui-dock", vertical && "lui-dock-vertical", className)}
        style={{ ["--lui-dock-size" as string]: `${size}px` }}
        onMouseMove={(event) => muisX.set(vertical ? event.clientY : event.clientX)}
        onMouseLeave={() => muisX.set(Number.POSITIVE_INFINITY)}
        {...rest}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
});

export interface DockItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd"> {
  /** Tekst die boven het icoon verschijnt bij het zweven. */
  label?: React.ReactNode;
  /** Stipje eronder, bv. voor "staat open". */
  active?: boolean;
  /** Rendert als link in plaats van als knop. */
  href?: string;
}

/** Eén icoon in de dock. */
export const DockItem = React.forwardRef<HTMLButtonElement, DockItemProps>(function DockItem(
  { label, active, href, className, children, ...rest },
  ref
) {
  const context = React.useContext(DockContext);
  if (!context) throw new Error("DockItem moet binnen <Dock> staan.");
  const rustig = useReducedMotion();

  const eigen = React.useRef<HTMLDivElement>(null);

  /* Afstand tussen het midden van dit item en de muis. */
  const verschil = useTransform(context.muisX, (muis: number) => {
    const rect = eigen.current?.getBoundingClientRect();
    if (!rect) return Number.POSITIVE_INFINITY;
    const midden = context.vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
    return muis - midden;
  });

  const doel = useTransform(
    verschil,
    [-context.afstand, 0, context.afstand],
    [context.grootte, context.vergroting, context.grootte],
    { clamp: true }
  );
  const maat = useSpring(doel, { stiffness: 260, damping: 22, mass: 0.2 });

  const inhoud = (
    <>
      <span className="lui-dock-icon">{children}</span>
      {label && <span className="lui-dock-label">{label}</span>}
      {active && <span className="lui-dock-dot" aria-hidden="true" />}
    </>
  );

  return (
    <motion.div
      ref={eigen}
      className="lui-dock-slot"
      style={rustig ? { width: context.grootte, height: context.grootte } : { width: maat, height: maat }}
    >
      {href ? (
        <a href={href} className={cn("lui-dock-item", className)} aria-label={typeof label === "string" ? label : undefined}>
          {inhoud}
        </a>
      ) : (
        <button
          ref={ref}
          type="button"
          className={cn("lui-dock-item", className)}
          aria-label={typeof label === "string" ? label : undefined}
          {...rest}
        >
          {inhoud}
        </button>
      )}
    </motion.div>
  );
});
