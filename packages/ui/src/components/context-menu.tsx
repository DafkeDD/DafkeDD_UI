"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, composeRefs } from "../lib/slot";
import { useControllableState } from "../lib/hooks";
import { MenuProvider, DropdownMenuContent, type DropdownMenuContentProps } from "./dropdown-menu";

interface Punt {
  x: number;
  y: number;
}

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  punt: Punt;
  setPunt: (punt: Punt) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

function useContextMenu(component: string): ContextMenuContextValue {
  const context = React.useContext(ContextMenuContext);
  if (!context) throw new Error(`<${component}> moet binnen <ContextMenu> staan.`);
  return context;
}

export interface ContextMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

/**
 * ContextMenu — menu op de rechtermuisknop, op de plek van de cursor.
 *
 * Gebruikt dezelfde items als DropdownMenu: DropdownMenuItem, -Label,
 * -Separator, -Group en -CheckboxItem werken hierbinnen gewoon.
 */
export function ContextMenu({ open, defaultOpen = false, onOpenChange, children }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [punt, setPunt] = React.useState<Punt>({ x: 0, y: 0 });
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <ContextMenuContext.Provider
      value={{ open: isOpen, setOpen: setIsOpen, punt, setPunt, anchorRef, contentRef }}
    >
      {children}
    </ContextMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  disabled?: boolean;
}

/** Het gebied waarop de rechtermuisknop het menu opent. */
export const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger({ asChild, disabled, onContextMenu, className, ...rest }, ref) {
    const { setOpen, setPunt } = useContextMenu("ContextMenuTrigger");
    const Comp = (asChild ? Slot : "div") as React.ElementType;

    return (
      <Comp
        ref={ref}
        className={asChild ? className : cn("lui-context-trigger", className)}
        onContextMenu={(event: React.MouseEvent<HTMLDivElement>) => {
          onContextMenu?.(event);
          if (disabled) return;
          event.preventDefault();
          // Een nieuwe plek geeft het menu een nieuwe key (zie ContextMenuContent),
          // zodat het opnieuw opent en zich op de cursor positioneert.
          setPunt({ x: event.clientX, y: event.clientY });
          setOpen(true);
        }}
        {...rest}
      />
    );
  }
);

export type ContextMenuContentProps = Omit<DropdownMenuContentProps, "side" | "align" | "matchWidth">;

export const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent({ offset = 2, ...rest }, ref) {
    const { open, setOpen, punt, anchorRef, contentRef } = useContextMenu("ContextMenuContent");

    return (
      <>
        {/* Onzichtbaar ankertje op de cursorpositie; daar hangt het menu aan. */}
        <span
          ref={composeRefs(anchorRef as React.Ref<HTMLSpanElement>)}
          aria-hidden="true"
          style={{ position: "fixed", left: punt.x, top: punt.y, width: 1, height: 1, pointerEvents: "none" }}
        />
        <MenuProvider value={{ open, setOpen, anchorRef, contentRef }}>
          <DropdownMenuContent
            key={`${punt.x}:${punt.y}`}
            ref={ref}
            side="bottom"
            align="start"
            offset={offset}
            {...rest}
          />
        </MenuProvider>
      </>
    );
  }
);
