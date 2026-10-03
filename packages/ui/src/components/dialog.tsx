"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { Slot } from "../lib/slot";
import { useControllableState, useEscapeKey, useFocusTrap, useLockScroll, usePresence } from "../lib/hooks";
import { Button } from "./button";
import { Icon } from "../icons/icon";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog(component: string): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error(`<${component}> moet binnen <Dialog> staan.`);
  return context;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

/** Dialog — modaal venster met overlay, focus-trap en Escape-afhandeling. */
export function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = React.useId();

  return (
    <DialogContext.Provider
      value={{
        open: isOpen,
        setOpen: setIsOpen,
        titleId: `lui-dialog-title-${id}`,
        descriptionId: `lui-dialog-desc-${id}`,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ asChild, onClick, ...rest }, ref) {
    const { setOpen } = useDialog("DialogTrigger");
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

/** Sluit de dialog; wikkel er een knop in met `asChild`. */
export const DialogClose = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(function DialogClose(
  { asChild, onClick, ...rest },
  ref
) {
  const { setOpen } = useDialog("DialogClose");
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

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Verbergt het kruisje rechtsboven. */
  hideClose?: boolean;
  /** Klik op de overlay sluit niet. */
  static?: boolean;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    { size = "md", hideClose, static: isStatic, className, children, ...rest },
    ref
  ) {
    const { open, setOpen, titleId, descriptionId } = useDialog("DialogContent");
    const panelRef = React.useRef<HTMLDivElement>(null);

    const { render, state } = usePresence(open, panelRef);

    useEscapeKey(() => setOpen(false), open);
    useLockScroll(open);
    useFocusTrap(panelRef, open);

    if (!render) return null;

    return (
      <Portal>
        <div
          className="lui-overlay"
          data-state={state}
          onMouseDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (!isStatic) {
              setOpen(false);
              return;
            }
            // Statisch: niet sluiten, maar kort "veren" zodat duidelijk is dat
            // je eerst een keuze moet maken.
            const panel = panelRef.current;
            if (!panel || typeof panel.animate !== "function") return;
            if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
            panel.animate(
              [{ transform: "scale(1)" }, { transform: "scale(1.025)" }, { transform: "scale(.995)" }, { transform: "scale(1)" }],
              { duration: 320, easing: "cubic-bezier(.3, 1.3, .5, 1)" }
            );
          }}
        >
          <div className="lui-overlay-blur" aria-hidden="true" />
          <div
            ref={(node) => {
              (panelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
              if (typeof ref === "function") ref(node as HTMLDivElement);
              else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            data-state={state}
            className={cn("lui-dialog", `lui-dialog-${size}`, className)}
            {...rest}
          >
            {!hideClose && (
              <Button
                variant="ghost"
                size="sm"
                className="lui-dialog-close"
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

export const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-dialog-header", className)} {...rest} />;
  }
);

export const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function DialogTitle({ className, ...rest }, ref) {
    const { titleId } = useDialog("DialogTitle");
    return <h2 ref={ref} id={titleId} className={cn("lui-dialog-title", className)} {...rest} />;
  }
);

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function DialogDescription({ className, ...rest }, ref) {
  const { descriptionId } = useDialog("DialogDescription");
  return <p ref={ref} id={descriptionId} className={cn("lui-dialog-description", className)} {...rest} />;
});

export const DialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-dialog-body", className)} {...rest} />;
  }
);

export const DialogFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-dialog-footer", className)} {...rest} />;
  }
);
