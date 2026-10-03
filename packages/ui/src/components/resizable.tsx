"use client";
import * as React from "react";
import { cn } from "../lib/cn";

type Richting = "horizontal" | "vertical";

interface ResizableContextValue {
  direction: Richting;
  sizes: number[];
  setSizes: React.Dispatch<React.SetStateAction<number[]>>;
  registreer: (index: number, min: number, max: number) => void;
  grenzen: React.RefObject<Array<{ min: number; max: number }>>;
  groepRef: React.RefObject<HTMLDivElement | null>;
}

const ResizableContext = React.createContext<ResizableContextValue | null>(null);

function useResizable(component: string): ResizableContextValue {
  const context = React.useContext(ResizableContext);
  if (!context) throw new Error(`<${component}> moet binnen <ResizableGroup> staan.`);
  return context;
}

export interface ResizableGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: Richting;
  /** Beginverdeling in procenten, één getal per paneel. */
  defaultSizes?: number[];
  /** Roept de nieuwe verdeling terug na elke sleepbeweging. */
  onSizesChange?: (sizes: number[]) => void;
}

/**
 * ResizableGroup — panelen met een sleepbare scheiding ertussen.
 *
 * <ResizableGroup defaultSizes={[30, 70]}>
 *   <ResizablePanel>…</ResizablePanel>
 *   <ResizableHandle />
 *   <ResizablePanel>…</ResizablePanel>
 * </ResizableGroup>
 */
export const ResizableGroup = React.forwardRef<HTMLDivElement, ResizableGroupProps>(function ResizableGroup(
  { direction = "horizontal", defaultSizes, onSizesChange, className, children, ...rest },
  ref
) {
  const groepRef = React.useRef<HTMLDivElement | null>(null);
  const grenzen = React.useRef<Array<{ min: number; max: number }>>([]);

  const aantal = React.Children.toArray(children).filter(
    (kind) => React.isValidElement(kind) && (kind.type as { luiPanel?: boolean }).luiPanel
  ).length;

  const [sizes, setSizes] = React.useState<number[]>(
    () => defaultSizes ?? Array.from({ length: Math.max(aantal, 1) }, () => 100 / Math.max(aantal, 1))
  );

  const registreer = React.useCallback((index: number, min: number, max: number) => {
    grenzen.current[index] = { min, max };
  }, []);

  const vorige = React.useRef(sizes);
  React.useEffect(() => {
    if (vorige.current !== sizes) {
      vorige.current = sizes;
      onSizesChange?.(sizes);
    }
  }, [sizes, onSizesChange]);

  return (
    <ResizableContext.Provider value={{ direction, sizes, setSizes, registreer, grenzen, groepRef }}>
      <div
        ref={(node) => {
          groepRef.current = node;
          if (typeof ref === "function") ref(node as HTMLDivElement);
          else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("lui-resizable", `lui-resizable-${direction}`, className)}
        {...rest}
      >
        {children}
      </div>
    </ResizableContext.Provider>
  );
});

export interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Volgorde in de groep; nodig omdat panelen en grepen door elkaar staan. */
  index: number;
  /** Ondergrens in procenten. */
  minSize?: number;
  /** Bovengrens in procenten. */
  maxSize?: number;
}

export const ResizablePanel = Object.assign(
  React.forwardRef<HTMLDivElement, ResizablePanelProps>(function ResizablePanel(
    { index, minSize = 10, maxSize = 90, className, style, ...rest },
    ref
  ) {
    const { sizes, registreer } = useResizable("ResizablePanel");

    React.useEffect(() => {
      registreer(index, minSize, maxSize);
    }, [index, minSize, maxSize, registreer]);

    return (
      <div
        ref={ref}
        className={cn("lui-resizable-panel", className)}
        style={{ flexBasis: `${sizes[index] ?? 50}%`, ...style }}
        {...rest}
      />
    );
  }),
  { luiPanel: true }
);

export interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Welke twee panelen deze greep verdeelt: index en index + 1. */
  index: number;
  /** Streepje in het midden van de greep. */
  withGrip?: boolean;
}

export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(function ResizableHandle(
  { index, withGrip = true, className, ...rest },
  ref
) {
  const { direction, setSizes, grenzen, groepRef } = useResizable("ResizableHandle");
  const [bezig, setBezig] = React.useState(false);

  const verplaats = React.useCallback(
    (delta: number) => {
      setSizes((vorige) => {
        const volgende = [...vorige];
        const a = grenzen.current[index] ?? { min: 10, max: 90 };
        const b = grenzen.current[index + 1] ?? { min: 10, max: 90 };
        const nieuwA = Math.min(Math.max(volgende[index] + delta, a.min), a.max);
        const verschil = nieuwA - volgende[index];
        const nieuwB = volgende[index + 1] - verschil;
        if (nieuwB < b.min || nieuwB > b.max) return vorige;
        volgende[index] = nieuwA;
        volgende[index + 1] = nieuwB;
        return volgende;
      });
    },
    [index, setSizes, grenzen]
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const groep = groepRef.current;
    if (!groep) return;
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    setBezig(true);

    const rect = groep.getBoundingClientRect();
    const totaal = direction === "horizontal" ? rect.width : rect.height;
    let laatste = direction === "horizontal" ? event.clientX : event.clientY;

    const onMove = (beweging: PointerEvent) => {
      const nu = direction === "horizontal" ? beweging.clientX : beweging.clientY;
      verplaats(((nu - laatste) / totaal) * 100);
      laatste = nu;
    };
    const onUp = () => {
      setBezig(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={direction === "horizontal" ? "vertical" : "horizontal"}
      tabIndex={0}
      data-dragging={bezig ? "" : undefined}
      className={cn("lui-resizable-handle", className)}
      onPointerDown={onPointerDown}
      onKeyDown={(event) => {
        const stap = event.shiftKey ? 10 : 2;
        const min = direction === "horizontal" ? "ArrowLeft" : "ArrowUp";
        const plus = direction === "horizontal" ? "ArrowRight" : "ArrowDown";
        if (event.key === min) {
          event.preventDefault();
          verplaats(-stap);
        } else if (event.key === plus) {
          event.preventDefault();
          verplaats(stap);
        }
      }}
      {...rest}
    >
      {withGrip && <span className="lui-resizable-grip" aria-hidden="true" />}
    </div>
  );
});
