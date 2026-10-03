"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState, useEscapeKey, useFocusTrap, useLockScroll, usePresence } from "../lib/hooks";
import { Button } from "./button";
import { Icon } from "../icons/icon";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawer(component: string): DrawerContextValue {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error(`<${component}> moet binnen <Drawer> staan.`);
  return context;
}

/** Zodat een eigen paneel (zoals de motion-variant) in dezelfde Drawer kan hangen. */
export function useDrawerContext(component = "DrawerContent"): DrawerContextValue {
  return useDrawer(component);
}

export type { DrawerContextValue };

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

/** Drawer — paneel dat vanaf een zijkant inschuift (ook wel "sheet"). */
export function Drawer({ open, defaultOpen = false, onOpenChange, children }: DrawerProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = React.useId();

  return (
    <DrawerContext.Provider value={{ open: isOpen, setOpen: setIsOpen, titleId: `lui-drawer-title-${id}` }}>
      {children}
    </DrawerContext.Provider>
  );
}

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  function DrawerTrigger({ asChild, onClick, ...rest }, ref) {
    const { setOpen } = useDrawer("DrawerTrigger");
    const Comp = (asChild ? Slot : "button") as React.ElementType;
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : "button"}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          setOpen(true);
        }}
        {...rest}
      />
    );
  }
);

export const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(function DrawerClose(
  { asChild, onClick, ...rest },
  ref
) {
  const { setOpen } = useDrawer("DrawerClose");
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...rest}
    />
  );
});

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: "left" | "right" | "top" | "bottom";
  /** Breedte (links/rechts) of hoogte (boven/onder). */
  size?: number | string;
  hideClose?: boolean;
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  function DrawerContent({ side = "right", size, hideClose, className, children, style, ...rest }, ref) {
    const { open, setOpen, titleId } = useDrawer("DrawerContent");
    const panelRef = React.useRef<HTMLDivElement>(null);

    const { render, state } = usePresence(open, panelRef, 300);

    useEscapeKey(() => setOpen(false), open);
    useLockScroll(open);
    useFocusTrap(panelRef, open);

    if (!render) return null;
    const horizontal = side === "left" || side === "right";

    return (
      <Portal>
        <div
          className="lui-overlay lui-overlay-plain"
          data-state={state}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={(node) => {
              (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === "function") ref(node as HTMLDivElement);
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-state={state}
            className={cn("lui-drawer", `lui-drawer-${side}`, className)}
            style={{ ...(size ? { [horizontal ? "width" : "height"]: size } : {}), ...style }}
            {...rest}
          >
            {!hideClose && (
              <Button
                variant="ghost"
                size="sm"
                className="lui-drawer-close"
                aria-label="Sluiten"
                icon={<Icon name="x" size={16} />}
                onClick={() => setOpen(false)}
              />
            )}
            {children}
          </div>
        </div>
      </Portal>
    );
  }
);

export const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DrawerHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-drawer-header", className)} {...rest} />;
  }
);

export const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function DrawerTitle({ className, ...rest }, ref) {
    const { titleId } = useDrawer("DrawerTitle");
    return <h2 ref={ref} id={titleId} className={cn("lui-drawer-title", className)} {...rest} />;
  }
);

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function DrawerDescription({ className, ...rest }, ref) {
  return <p ref={ref} className={cn("lui-drawer-description", className)} {...rest} />;
});

export const DrawerBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DrawerBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-drawer-body", className)} {...rest} />;
  }
);

export const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DrawerFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-drawer-footer", className)} {...rest} />;
  }
);
