"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, slotChildren } from "../lib/slot";
import { useControllableState, useOutsideClick } from "../lib/hooks";
import { Icon } from "../icons/icon";

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  /** Tekst naast het icoon; zonder tekst blijft het een ronde knop. */
  children?: React.ReactNode;
  size?: "md" | "lg";
  /** Vaste plek rechtsonder (standaard) of gewoon in de stroom. */
  position?: "bottom-right" | "bottom-left" | "static";
  asChild?: boolean;
}

/** Fab — zwevende hoofdactie, meestal rechtsonder op mobiel. */
export const Fab = React.forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { icon, children, size = "md", position = "bottom-right", asChild, className, ...rest },
  ref
) {
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  const slot = slotChildren(asChild, children);

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      className={cn(
        "lui-fab",
        `lui-fab-${size}`,
        position !== "static" && `lui-fab-${position}`,
        !slot.inner && "lui-fab-rond",
        className
      )}
      {...rest}
    >
      {slot.wrap(
        <>
          {icon ?? <Icon name="plus" size={size === "lg" ? 24 : 20} />}
          {slot.inner && <span className="lui-fab-label">{slot.inner}</span>}
        </>
      )}
    </Comp>
  );
});

/* ------------------------------------------------------------------ */
/* SpeedDial                                                           */
/* ------------------------------------------------------------------ */
export interface SpeedDialProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: "bottom-right" | "bottom-left" | "static";
  /** Knop die het waaiertje opent. */
  trigger?: React.ReactNode;
  label?: string;
}

/**
 * SpeedDial — Fab die openklapt naar een paar snelle acties.
 * De acties zet je erin als <SpeedDialAction>.
 */
export const SpeedDial = React.forwardRef<HTMLDivElement, SpeedDialProps>(function SpeedDial(
  { open, defaultOpen = false, onOpenChange, position = "bottom-right", trigger, label = "Snelle acties", className, children, ...rest },
  ref
) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const eigen = React.useRef<HTMLDivElement | null>(null);

  useOutsideClick([eigen], () => setIsOpen(false), isOpen);

  return (
    <div
      ref={(node) => {
        eigen.current = node;
        if (typeof ref === "function") ref(node as HTMLDivElement);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
      }}
      data-state={isOpen ? "open" : "closed"}
      className={cn("lui-speeddial", position !== "static" && `lui-fab-${position}`, className)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setIsOpen(false);
      }}
      {...rest}
    >
      <div className="lui-speeddial-acties" role="menu" aria-label={label} hidden={!isOpen}>
        {children}
      </div>
      {trigger ?? (
        <Fab
          position="static"
          aria-expanded={isOpen}
          aria-label={label}
          className="lui-speeddial-trigger"
          icon={<Icon name={isOpen ? "x" : "plus"} size={20} />}
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
    </div>
  );
});

export interface SpeedDialActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  /** Tekst links van de knop. */
  label: React.ReactNode;
}

export const SpeedDialAction = React.forwardRef<HTMLButtonElement, SpeedDialActionProps>(
  function SpeedDialAction({ icon, label, className, ...rest }, ref) {
    return (
      <button ref={ref} type="button" role="menuitem" className={cn("lui-speeddial-actie", className)} {...rest}>
        <span className="lui-speeddial-actie-label">{label}</span>
        <span className="lui-speeddial-actie-icoon">{icon}</span>
      </button>
    );
  }
);
