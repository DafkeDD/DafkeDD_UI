"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { Slot, composeRefs } from "../lib/slot";
import { useAnchorPosition, type Align, type Side } from "../lib/anchor";
import { useControllableState, useEscapeKey, usePresence } from "../lib/hooks";

interface HoverCardContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  openen: () => void;
  sluiten: () => void;
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCard(component: string): HoverCardContextValue {
  const context = React.useContext(HoverCardContext);
  if (!context) throw new Error(`<${component}> moet binnen <HoverCard> staan.`);
  return context;
}

export interface HoverCardProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Wachttijd voor openen, in ms. */
  openDelay?: number;
  /** Wachttijd voor sluiten, zodat je met de muis naar de kaart kan. */
  closeDelay?: number;
  children?: React.ReactNode;
}

/**
 * HoverCard — kaartje met extra context bij hoveren, bijvoorbeeld een
 * patiëntoverzicht bij een naam. Groter dan een Tooltip, zonder klik nodig.
 * Alleen voor aanvullende informatie: op touch bestaat hoveren niet.
 */
export function HoverCard({
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 260,
  closeDelay = 160,
  children,
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const timer = React.useRef<number | undefined>(undefined);

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  React.useEffect(() => stop, []);

  const openen = () => {
    stop();
    timer.current = window.setTimeout(() => setIsOpen(true), openDelay);
  };
  const sluiten = () => {
    stop();
    timer.current = window.setTimeout(() => setIsOpen(false), closeDelay);
  };

  return (
    <HoverCardContext.Provider value={{ open: isOpen, setOpen: setIsOpen, anchorRef, contentRef, openen, sluiten }}>
      {children}
    </HoverCardContext.Provider>
  );
}

export interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

export const HoverCardTrigger = React.forwardRef<HTMLElement, HoverCardTriggerProps>(
  function HoverCardTrigger({ asChild, className, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest }, ref) {
    const { anchorRef, openen, sluiten, setOpen } = useHoverCard("HoverCardTrigger");
    const Comp = (asChild ? Slot : "span") as React.ElementType;

    return (
      <Comp
        ref={composeRefs(ref, anchorRef)}
        className={asChild ? className : cn("lui-hovercard-trigger", className)}
        onMouseEnter={(event: React.MouseEvent<HTMLElement>) => {
          onMouseEnter?.(event);
          openen();
        }}
        onMouseLeave={(event: React.MouseEvent<HTMLElement>) => {
          onMouseLeave?.(event);
          sluiten();
        }}
        // Toetsenbordgebruikers krijgen de kaart bij focus.
        onFocus={(event: React.FocusEvent<HTMLElement>) => {
          onFocus?.(event);
          setOpen(true);
        }}
        onBlur={(event: React.FocusEvent<HTMLElement>) => {
          onBlur?.(event);
          setOpen(false);
        }}
        {...rest}
      />
    );
  }
);

export interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  offset?: number;
  width?: number | string;
}

export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    {
      side = "bottom",
      align = "start",
      offset = 8,
      width = 280,
      className,
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref
  ) {
    const { open, setOpen, anchorRef, contentRef, openen, sluiten } = useHoverCard("HoverCardContent");
    const { render: zichtbaar, state: fase } = usePresence(open, contentRef, 160);
    const position = useAnchorPosition(anchorRef, contentRef, zichtbaar, { side, align, offset });

    useEscapeKey(() => setOpen(false), open);

    if (!zichtbaar) return null;

    return (
      <Portal>
        <div
          ref={composeRefs(ref, contentRef)}
          role="tooltip" data-state={fase}
          data-side={position.side}
          className={cn("lui-hovercard", className)}
          style={{ width, ...position.style, ...style, opacity: position.ready ? 1 : 0 }}
          {...rest}
          // Ná {...rest}: de kaart moet open blijven terwijl je er met de muis
          // naartoe beweegt, ook als de gebruiker zelf mouse-handlers meegeeft.
          onMouseEnter={(event) => {
            onMouseEnter?.(event);
            openen();
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event);
            sluiten();
          }}
        >
          {children}
        </div>
      </Portal>
    );
  }
);
