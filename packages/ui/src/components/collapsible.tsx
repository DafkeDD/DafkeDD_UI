"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot } from "../lib/slot";
import { useControllableState } from "../lib/hooks";
import { Icon } from "../icons/icon";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerId: string;
  disabled?: boolean;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible(component: string): CollapsibleContextValue {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error(`<${component}> moet binnen <Collapsible> staan.`);
  return context;
}

export interface CollapsibleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

/**
 * Collapsible — één stuk inhoud dat open- en dichtklapt, zonder de
 * accordeon-logica van Accordion. De hoogte wordt echt geanimeerd.
 */
export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { open, defaultOpen = false, onOpenChange, disabled, className, children, ...rest },
  ref
) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = React.useId();

  return (
    <CollapsibleContext.Provider
      value={{
        open: isOpen,
        setOpen: setIsOpen,
        contentId: `lui-collapsible-content-${id}`,
        triggerId: `lui-collapsible-trigger-${id}`,
        disabled,
      }}
    >
      <div
        ref={ref}
        data-state={isOpen ? "open" : "closed"}
        className={cn("lui-collapsible", className)}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
});

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  /** Chevron rechts die meedraait. */
  chevron?: boolean;
}

export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ asChild, chevron, className, children, onClick, ...rest }, ref) {
    const { open, setOpen, contentId, triggerId, disabled } = useCollapsible("CollapsibleTrigger");
    const Comp = (asChild ? Slot : "button") as React.ElementType;

    return (
      <Comp
        ref={ref}
        id={triggerId}
        type={asChild ? undefined : "button"}
        aria-expanded={open}
        aria-controls={contentId}
        disabled={asChild ? undefined : disabled}
        data-state={open ? "open" : "closed"}
        className={asChild ? className : cn("lui-collapsible-trigger", className)}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (!disabled) setOpen(!open);
        }}
        {...rest}
      >
        {children}
        {chevron && (
          <span className="lui-collapsible-chevron" aria-hidden="true">
            <Icon name="chevronDown" size={16} />
          </span>
        )}
      </Comp>
    );
  }
);

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Blijft in de DOM staan als hij dicht is (standaard), zodat zoeken op de pagina werkt. */
  forceMount?: boolean;
}

export const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ forceMount = true, className, children, ...rest }, ref) {
    const { open, contentId, triggerId } = useCollapsible("CollapsibleContent");

    if (!open && !forceMount) return null;

    return (
      // De buitenste laag animeert de hoogte met grid-template-rows: 0fr -> 1fr.
      // Dat werkt zonder de hoogte te meten, ook bij inhoud die verandert.
      <div
        ref={ref}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        data-state={open ? "open" : "closed"}
        className={cn("lui-collapsible-content", className)}
        {...rest}
      >
        <div className="lui-collapsible-inner">{children}</div>
      </div>
    );
  }
);
