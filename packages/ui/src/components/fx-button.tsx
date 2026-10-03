"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "../icons/icon";
import { Slot, slotChildren } from "../lib/slot";

export type FxEffect =
  | "typewriter"
  | "rocket"
  | "swap"
  | "spark"
  | "circle"
  | "shine"
  | "flip"
  | "expand"
  | "badge"
  | "warp";

export interface FxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Welke beweging bij hover en focus. */
  effect: FxEffect;
  /**
   * Tweede tekst: wat de typemachine intypt, wat op de achterkant van flip staat,
   * of wat verschijnt als expand openschuift.
   */
  hoverLabel?: string;
  /** Eigen icoon; elk effect heeft er anders een passend standaardicoon. */
  icon?: IconName;
  /** Kleurverloop van de gevulde varianten. */
  tone?: "accent" | "violet" | "sunset";
  size?: "sm" | "md" | "lg";
  /** Rendert het kind in plaats van een <button>, bv. een link. */
  asChild?: boolean;
}

const STANDAARD_ICOON: Partial<Record<FxEffect, IconName>> = {
  rocket: "send",
  swap: "send",
  circle: "chevronRight",
  expand: "sparkles",
  badge: "arrowRight",
};

/** Welke effecten een gevulde knop zijn; de rest is een omlijnde. */
const GEVULD: FxEffect[] = ["rocket", "swap", "shine", "expand"];

/**
 * FxButton — knop met één van tien hover-effecten: typemachine, raket,
 * icoonwissel, vonk, cirkel, glans, omslag, uitschuiven, badge en warp.
 * Allemaal CSS, behalve het typen, en allemaal ook op toetsenbordfocus.
 */
export const FxButton = React.forwardRef<HTMLButtonElement, FxButtonProps>(function FxButton(
  {
    effect,
    hoverLabel,
    icon,
    tone = "accent",
    size = "md",
    asChild,
    className,
    children: kinderen,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  // Met asChild is het label de inhoud van het meegegeven element (bv. de tekst in <a>).
  const slot = slotChildren(asChild, kinderen);
  const children = slot.inner;
  const icoon = icon ?? STANDAARD_ICOON[effect];
  const label = typeof children === "string" ? children : "";

  /* Typemachine: bij hover wordt de tekst gewist en letter voor letter opnieuw getypt. */
  const [getypt, setGetypt] = React.useState<string | null>(null);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearInterval(timer.current), []);

  const startTypen = () => {
    if (effect !== "typewriter") return;
    const doel = hoverLabel ?? label;
    window.clearInterval(timer.current);
    let n = 0;
    setGetypt("");
    timer.current = window.setInterval(() => {
      n += 1;
      setGetypt(doel.slice(0, n));
      if (n >= doel.length) window.clearInterval(timer.current);
    }, 70);
  };
  const stopTypen = () => {
    if (effect !== "typewriter") return;
    window.clearInterval(timer.current);
    setGetypt(null);
  };

  const binnen = () => startTypen();
  const buiten = () => stopTypen();

  let inhoud: React.ReactNode;
  switch (effect) {
    case "typewriter":
      inhoud = (
        <span className="lui-fx-label">
          {getypt ?? children}
          {getypt !== null && <span className="lui-fx-caret" aria-hidden="true" />}
        </span>
      );
      break;
    case "rocket":
      inhoud = (
        <>
          <span className="lui-fx-rocketicon" aria-hidden="true">
            {icoon && <Icon name={icoon} size={15} />}
          </span>
          <span className="lui-fx-label">{children}</span>
        </>
      );
      break;
    case "swap":
      inhoud = (
        <>
          <span className="lui-fx-label">{children}</span>
          <span className="lui-fx-swapicon" aria-hidden="true">
            {icoon && <Icon name={icoon} size={17} />}
          </span>
        </>
      );
      break;
    case "circle":
      inhoud = (
        <>
          <span className="lui-fx-blob" aria-hidden="true">
            {icoon && <Icon name={icoon} size={15} />}
          </span>
          <span className="lui-fx-label">{children}</span>
        </>
      );
      break;
    case "flip":
      inhoud = (
        <span className="lui-fx-flipper">
          <span className="lui-fx-face lui-fx-front">{children}</span>
          <span className="lui-fx-face lui-fx-back" aria-hidden="true">
            {hoverLabel ?? children}
          </span>
        </span>
      );
      break;
    case "expand":
      inhoud = (
        <>
          <span className="lui-fx-expandicon" aria-hidden="true">
            {icoon && <Icon name={icoon} size={16} />}
          </span>
          <span className="lui-fx-expandlabel">{hoverLabel ?? children}</span>
        </>
      );
      break;
    case "badge":
      inhoud = (
        <>
          <span className="lui-fx-label">{children}</span>
          <span className="lui-fx-badgedot" aria-hidden="true">
            {icoon && <Icon name={icoon} size={13} />}
          </span>
        </>
      );
      break;
    case "warp":
      inhoud = (
        <span className="lui-fx-label lui-fx-warplabel" data-text={label}>
          {children}
        </span>
      );
      break;
    default:
      inhoud = <span className="lui-fx-label">{children}</span>;
  }

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      className={cn(
        "lui-fx",
        `lui-fx-${effect}`,
        `lui-fx-${size}`,
        GEVULD.includes(effect) ? "lui-fx-filled" : "lui-fx-outline",
        className
      )}
      data-tone={tone}
      aria-label={effect === "expand" && typeof children === "string" ? children : undefined}
      onMouseEnter={(event: React.MouseEvent<HTMLButtonElement>) => {
        binnen();
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event: React.MouseEvent<HTMLButtonElement>) => {
        buiten();
        onMouseLeave?.(event);
      }}
      onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
        binnen();
        onFocus?.(event);
      }}
      onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
        buiten();
        onBlur?.(event);
      }}
      {...rest}
    >
      {slot.wrap(inhoud)}
    </Comp>
  );
});
