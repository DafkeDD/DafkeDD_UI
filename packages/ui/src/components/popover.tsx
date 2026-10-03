"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { Slot, composeRefs } from "../lib/slot";
import { useAnchorPosition, type Align, type Side } from "../lib/anchor";
import { useControllableState, useEscapeKey, useOutsideClick, usePresence } from "../lib/hooks";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover(component: string): PopoverContextValue {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error(`<${component}> moet binnen <Popover> staan.`);
  return context;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

/** Popover — zwevend paneel gekoppeld aan een trigger. */
export function Popover({ open, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen: setIsOpen, anchorRef, contentRef }}>
      {children}
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ asChild, onClick, ...rest }, ref) {
    const { open, setOpen, anchorRef } = usePopover("PopoverTrigger");
    const Comp = (asChild ? Slot : "button") as React.ElementType;

    return (
      <Comp
        ref={composeRefs(ref as React.Ref<HTMLElement>, anchorRef)}
        type={asChild ? undefined : "button"}
        aria-expanded={open}
        aria-haspopup="dialog"
        data-state={open ? "open" : "closed"}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          setOpen(!open);
        }}
        {...rest}
      />
    );
  }
);

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: Side;
  align?: Align;
  offset?: number;
  /** Zelfde breedte als de trigger. */
  matchWidth?: boolean;
  /** Geen binnenmarge (bv. voor een menu of lijst). */
  flush?: boolean;
}

export const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    { side = "bottom", align = "start", offset = 8, matchWidth, flush, className, children, style, ...rest },
    ref
  ) {
    const { open, setOpen, anchorRef, contentRef } = usePopover("PopoverContent");
    const { render, state } = usePresence(open, contentRef, 180);
    const position = useAnchorPosition(anchorRef, contentRef, render, { side, align, offset, matchWidth });

    useEscapeKey(() => setOpen(false), open);
    useOutsideClick([anchorRef, contentRef], () => setOpen(false), open);

    if (!render) return null;

    return (
      <Portal>
        <div
          ref={composeRefs(ref, contentRef)}
          role="dialog"
          data-side={position.side}
          data-state={state}
          className={cn("lui-popover", flush && "lui-popover-flush", className)}
          style={{ ...position.style, ...style, opacity: position.ready ? 1 : 0 }}
          {...rest}
        >
          {children}
        </div>
      </Portal>
    );
  }
);
