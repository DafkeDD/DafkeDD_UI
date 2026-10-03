"use client";
import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "../icons/icon";

export interface SwipeAction {
  label: React.ReactNode;
  icon?: IconName;
  tone?: "red" | "teal" | "accent" | "amber" | "blue" | "neutral";
  onAction: () => void;
  /**
   * Standaard glijdt de rij weg en klapt ze dicht voordat onAction loopt
   * (archiveren, verwijderen). Zet op false voor iets als "gelezen markeren":
   * dan veert de rij terug.
   */
  dismiss?: boolean;
}

export interface SwipeActionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"> {
  /** Acties links, zichtbaar als je naar rechts veegt. De eerste is de volle-veeg-actie. */
  leading?: SwipeAction[];
  /** Acties rechts, zichtbaar als je naar links veegt. De laatste is de volle-veeg-actie. */
  trailing?: SwipeAction[];
  /** Breedte van één knop in pixels. */
  actionWidth?: number;
  /** Vanaf welk deel van de rijbreedte een veeg de hoofdactie uitvoert (0–1). */
  commitRatio?: number;
  /** Laat de rij bij het tonen even opzij piepen, zodat mensen de acties ontdekken. */
  hint?: boolean;
  /** Korte trilling (waar het toestel dat kan) zodra je de commit-lijn passeert. */
  haptics?: boolean;
  disabled?: boolean;
  onOpenChange?: (side: "leading" | "trailing" | null) => void;
}

const VEER = { type: "spring", stiffness: 420, damping: 38 } as const;

/**
 * SwipeActions — rij met veegacties aan beide kanten en twee drempels:
 * een korte veeg toont de knoppen (een menu), een lange veeg voorbij de lijn
 * voert de hoofdactie meteen uit (een beslissing). Voorbij de knoppen wordt
 * de rij stroever, als een elastiekje.
 */
export const SwipeActions = React.forwardRef<HTMLDivElement, SwipeActionsProps>(function SwipeActions(
  {
    leading = [],
    trailing = [],
    actionWidth = 76,
    commitRatio = 0.55,
    hint,
    haptics = true,
    disabled,
    onOpenChange,
    className,
    children,
    ...rest
  },
  ref
) {
  const rustig = useReducedMotion();
  const wortel = React.useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [gewapend, setGewapend] = React.useState<"leading" | "trailing" | null>(null);
  const [open, setOpen] = React.useState<"leading" | "trailing" | null>(null);
  const [weg, setWeg] = React.useState(false);
  const sleep = React.useRef<{ id: number; x0: number; y0: number; start: number; actief: boolean } | null>(null);
  const breedte = React.useRef(320);
  const nuGesleept = React.useRef(false);

  const onthul = (kant: "leading" | "trailing") => (kant === "leading" ? leading : trailing).length * actionWidth;

  const zetOpen = (kant: "leading" | "trailing" | null) => {
    setOpen(kant);
    onOpenChange?.(kant);
    animate(x, kant === "leading" ? onthul("leading") : kant === "trailing" ? -onthul("trailing") : 0, VEER);
  };

  // Ontdekhint: even opzij piepen en terugveren.
  React.useEffect(() => {
    if (!hint || rustig || disabled) return;
    const kant = trailing.length ? -1 : leading.length ? 1 : 0;
    if (!kant) return;
    const t = window.setTimeout(async () => {
      await animate(x, kant * Math.min(56, actionWidth * 0.75), { type: "spring", stiffness: 260, damping: 18 });
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    }, 700);
    return () => window.clearTimeout(t);
  }, [hint, rustig, disabled, trailing.length, leading.length, actionWidth, x]);

  /** Rubberband: 1:1 tot de knoppen, daarna steeds stroever. */
  const elastiek = (ruw: number) => {
    const kant = ruw >= 0 ? "leading" : "trailing";
    const acties = kant === "leading" ? leading : trailing;
    const d = Math.abs(ruw);
    if (acties.length === 0) return Math.sign(ruw) * d * 0.18;
    const r = onthul(kant);
    if (d <= r) return ruw;
    const extra = d - r;
    return Math.sign(ruw) * (r + extra * (0.82 - Math.min(extra / 1400, 0.22)));
  };

  const commitGrens = () => breedte.current * commitRatio;

  /** Gewapend zodra de vinger (niet de rij) voorbij de commit-lijn is. */
  const bepaalGewapend = (ruw: number) => {
    const welke = ruw >= 0 ? "leading" : "trailing";
    const heeft = (welke === "leading" ? leading : trailing).length > 0;
    const nu = heeft && Math.abs(ruw) >= commitGrens() ? welke : null;
    if (nu !== gewapend) {
      setGewapend(nu);
      if (nu && haptics && typeof navigator !== "undefined") navigator.vibrate?.(8);
    }
  };

  const voerUit = async (actie: SwipeAction, kant: "leading" | "trailing") => {
    if (actie.dismiss === false) {
      zetOpen(null);
      actie.onAction();
      return;
    }
    setWeg(true);
    if (!rustig) {
      await animate(x, (kant === "leading" ? 1 : -1) * (breedte.current + 40), { duration: 0.2, ease: [0.4, 0, 1, 1] });
      if (wortel.current) {
        await animate(wortel.current, { height: 0, opacity: 0 }, { duration: 0.18, ease: [0.4, 0, 0.2, 1] });
      }
    }
    actie.onAction();
  };

  const hoofdactie = (kant: "leading" | "trailing") =>
    kant === "leading" ? leading[0] : trailing[trailing.length - 1];

  const breedteLinks = useTransform(x, (v) => Math.max(v, 0));
  const breedteRechts = useTransform(x, (v) => Math.max(-v, 0));

  const kant = (welke: "leading" | "trailing") => {
    const acties = welke === "leading" ? leading : trailing;
    if (acties.length === 0) return null;
    const hoofd = hoofdactie(welke);
    return (
      <motion.div
        className="lui-swipeact-side"
        data-side={welke}
        data-tone={hoofd.tone ?? (welke === "trailing" ? "red" : "teal")}
        data-armed={gewapend === welke ? "" : undefined}
        style={{ width: welke === "leading" ? breedteLinks : breedteRechts }}
      >
        {acties.map((actie, index) => {
          const isHoofd = actie === hoofd;
          return (
            <button
              key={index}
              type="button"
              className="lui-swipeact-btn"
              data-tone={actie.tone ?? (welke === "trailing" && isHoofd ? "red" : welke === "leading" ? "teal" : "neutral")}
              data-primary={isHoofd ? "" : undefined}
              tabIndex={open === welke ? 0 : -1}
              onFocus={() => open !== welke && zetOpen(welke)}
              onClick={() => void voerUit(actie, welke)}
            >
              {actie.icon && <Icon name={actie.icon} size={17} />}
              <span className="lui-swipeact-label">{actie.label}</span>
            </button>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div
      ref={(node) => {
        wortel.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn("lui-swipeact", className)}
      data-gone={weg ? "" : undefined}
      {...rest}
    >
      {kant("leading")}
      {kant("trailing")}
      <motion.div
        className="lui-swipeact-front"
        style={{ x }}
        onPointerDown={(event) => {
          if (disabled || weg || event.button !== 0) return;
          breedte.current = event.currentTarget.offsetWidth || breedte.current;
          sleep.current = { id: event.pointerId, x0: event.clientX, y0: event.clientY, start: x.get(), actief: false };
        }}
        onPointerMove={(event) => {
          const s = sleep.current;
          if (!s || s.id !== event.pointerId) return;
          const dx = event.clientX - s.x0;
          const dy = event.clientY - s.y0;
          if (!s.actief) {
            // Pas slepen als de beweging duidelijk horizontaal is; verticaal = scrollen.
            if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
              sleep.current = null;
              return;
            }
            if (Math.abs(dx) < 6) return;
            s.actief = true;
            nuGesleept.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }
          x.set(elastiek(s.start + dx));
          bepaalGewapend(s.start + dx);
        }}
        onPointerUp={() => {
          const s = sleep.current;
          sleep.current = null;
          if (!s?.actief) return;
          window.setTimeout(() => (nuGesleept.current = false), 0);
          const waarde = x.get();
          const welke = waarde >= 0 ? "leading" : "trailing";
          if (gewapend) {
            setGewapend(null);
            void voerUit(hoofdactie(gewapend), gewapend);
            return;
          }
          const acties = welke === "leading" ? leading : trailing;
          if (acties.length && Math.abs(waarde) > onthul(welke) / 2) zetOpen(welke);
          else zetOpen(null);
        }}
        onPointerCancel={() => {
          sleep.current = null;
          setGewapend(null);
          zetOpen(null);
        }}
        onClickCapture={(event) => {
          // Klik op een geopende rij sluit ze in plaats van de rij zelf te activeren.
          if (nuGesleept.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (open) {
            event.preventDefault();
            event.stopPropagation();
            zetOpen(null);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) zetOpen(null);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
});
