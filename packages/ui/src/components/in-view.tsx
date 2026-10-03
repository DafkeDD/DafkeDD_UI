"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface UseInViewOptions {
  /** Hoeveel van het element zichtbaar moet zijn, 0 tot 1. */
  amount?: number;
  /** Maar één keer aanslaan; daarna blijft de waarde true. */
  once?: boolean;
  /** Extra marge rond de kijkruimte, bv. "-80px". */
  margin?: string;
  /** Meten uitzetten; de waarde blijft dan false. */
  disabled?: boolean;
}

/** Vertelt of een element in beeld staat. Geeft de ref en de stand terug. */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { amount = 0.2, once = true, margin, disabled } = options;
  const ref = React.useRef<T>(null);
  const [inBeeld, setInBeeld] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;
    /* Zonder IntersectionObserver (oude browser, test) meteen tonen, anders
       blijft de inhoud voorgoed onzichtbaar. */
    if (typeof IntersectionObserver === "undefined") {
      setInBeeld(true);
      return;
    }

    const waarnemer = new IntersectionObserver(
      ([ingang]) => {
        if (ingang.isIntersecting) {
          setInBeeld(true);
          if (once) waarnemer.disconnect();
        } else if (!once) {
          setInBeeld(false);
        }
      },
      { threshold: amount, rootMargin: margin }
    );
    waarnemer.observe(el);
    return () => waarnemer.disconnect();
  }, [amount, once, margin, disabled]);

  return [ref, inBeeld];
}

export interface InViewProps extends React.HTMLAttributes<HTMLDivElement>, UseInViewOptions {
  /** Hoe de inhoud binnenkomt. */
  animation?: "fade" | "up" | "down" | "left" | "right" | "scale" | "none";
  /** Vertraging in milliseconden, handig om een rij na elkaar te laten komen. */
  delay?: number;
  duration?: number;
  /** Rendert een ander element, bv. "section" of "li". */
  as?: React.ElementType;
}

/**
 * InView — laat zijn inhoud binnenkomen zodra hij in beeld scrolt.
 * Werkt met een IntersectionObserver en een CSS-overgang, dus zonder
 * dependency en zonder werk per frame.
 */
export const InView = React.forwardRef<HTMLDivElement, InViewProps>(function InView(
  {
    animation = "up",
    delay = 0,
    duration = 520,
    amount,
    once,
    margin,
    disabled,
    as: Comp = "div",
    className,
    style,
    ...rest
  },
  ref
) {
  const [eigen, inBeeld] = useInView<HTMLDivElement>({ amount, once, margin, disabled });

  const zetRef = (node: HTMLDivElement | null) => {
    (eigen as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <Comp
      ref={zetRef}
      className={cn("lui-inview", `lui-inview-${animation}`, className)}
      data-visible={inBeeld ? "" : undefined}
      style={{
        ...style,
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
      {...rest}
    />
  );
});

export interface ScrollProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Meet het scrollen binnen dit element in plaats van dat van de pagina. */
  target?: React.RefObject<HTMLElement | null>;
  /** Bovenaan vastgezet over de volle breedte. */
  fixed?: boolean;
  height?: number;
  color?: string;
  /** Percentage naast de balk tonen. */
  showValue?: boolean;
  onProgressChange?: (progress: number) => void;
}

/**
 * ScrollProgress — balkje dat meegroeit met hoe ver je gescrold bent.
 * Meet met requestAnimationFrame, zodat er per scrollgebeurtenis maar één
 * berekening gebeurt.
 */
export const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  function ScrollProgress(
    { target, fixed, height = 3, color = "var(--accent)", showValue, onProgressChange, className, style, ...rest },
    ref
  ) {
    const [deel, setDeel] = React.useState(0);
    const melden = React.useRef(onProgressChange);
    melden.current = onProgressChange;

    React.useEffect(() => {
      let frame = 0;

      const meet = () => {
        frame = 0;
        const el = target?.current;
        let waarde = 0;
        if (el) {
          const maximaal = el.scrollHeight - el.clientHeight;
          waarde = maximaal > 0 ? el.scrollTop / maximaal : 0;
        } else {
          const maximaal = document.documentElement.scrollHeight - window.innerHeight;
          waarde = maximaal > 0 ? window.scrollY / maximaal : 0;
        }
        const geklemd = Math.min(Math.max(waarde, 0), 1);
        setDeel(geklemd);
        melden.current?.(geklemd);
      };

      const plan = () => {
        if (!frame) frame = requestAnimationFrame(meet);
      };

      const bron: HTMLElement | Window = target?.current ?? window;
      meet();
      bron.addEventListener("scroll", plan, { passive: true });
      window.addEventListener("resize", plan);
      return () => {
        if (frame) cancelAnimationFrame(frame);
        bron.removeEventListener("scroll", plan);
        window.removeEventListener("resize", plan);
      };
    }, [target]);

    return (
      <div
        ref={ref}
        className={cn("lui-scrollprogress", fixed && "lui-scrollprogress-fixed", className)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(deel * 100)}
        aria-label="Leesvoortgang"
        style={{ ...style, height }}
        {...rest}
      >
        <span
          className="lui-scrollprogress-bar"
          style={{ width: `${deel * 100}%`, background: color }}
        />
        {showValue && <span className="lui-scrollprogress-value">{Math.round(deel * 100)}%</span>}
      </div>
    );
  }
);
