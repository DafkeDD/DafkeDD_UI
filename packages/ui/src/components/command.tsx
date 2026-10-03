"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Dialog, DialogContent } from "./dialog";

interface CommandContextValue {
  query: string;
  setQuery: (query: string) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  matches: (text: string) => boolean;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommand(component: string): CommandContextValue {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error(`<${component}> moet binnen <Command> staan.`);
  return context;
}

const ITEM_SELECTOR = '[data-lui-command-item]:not([hidden]):not([data-disabled])';

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Externe zoekterm (controlled). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Eigen filterfunctie; standaard een simpele "bevat"-match. */
  filter?: (text: string, query: string) => boolean;
}

/** Command — zoek- en actiepalet (⌘K), volledig eigen implementatie. */
export const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command(
  { value, onValueChange, filter, className, children, onKeyDown, ...rest },
  ref
) {
  const [internal, setInternal] = React.useState("");
  const query = value ?? internal;
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const setQuery = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const matches = React.useCallback(
    (text: string) => {
      if (!query.trim()) return true;
      if (filter) return filter(text, query);
      return text.toLowerCase().includes(query.toLowerCase());
    },
    [query, filter]
  );

  const move = (delta: number) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
    if (items.length === 0) return;
    const currentIndex = items.findIndex((item) => item.hasAttribute("data-active"));
    const nextIndex = (currentIndex + delta + items.length) % items.length;
    items.forEach((item) => item.removeAttribute("data-active"));
    const next = items[nextIndex];
    next.setAttribute("data-active", "");
    next.scrollIntoView({ block: "nearest" });
  };

  React.useEffect(() => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
    items.forEach((item) => item.removeAttribute("data-active"));
    items[0]?.setAttribute("data-active", "");
  }, [query, children]);

  return (
    <CommandContext.Provider value={{ query, setQuery, listRef, matches }}>
      <div
        ref={ref}
        className={cn("lui-command", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            move(1);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            move(-1);
          } else if (event.key === "Enter") {
            const active = listRef.current?.querySelector<HTMLElement>("[data-active]");
            if (active) {
              event.preventDefault();
              active.click();
            }
          }
        }}
        {...rest}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
});

export interface CommandInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  icon?: React.ReactNode;
}

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
  { icon, className, placeholder = "Typ een commando of zoek…", ...rest },
  ref
) {
  const { query, setQuery } = useCommand("CommandInput");

  return (
    <div className={cn("lui-command-input-wrap", className)}>
      <span className="lui-command-input-icon">{icon ?? <Icon name="search" size={17} />}</span>
      <input
        ref={ref}
        className="lui-command-input"
        placeholder={placeholder}
        value={query}
        autoFocus
        onChange={(event) => setQuery(event.target.value)}
        {...rest}
      />
    </div>
  );
});

export const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CommandList({ className, children, ...rest }, ref) {
    const { listRef } = useCommand("CommandList");
    return (
      <div
        ref={(node) => {
          (listRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node as HTMLDivElement);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="listbox"
        className={cn("lui-command-list", className)}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

/** Wordt alleen getoond wanneer geen enkel item overblijft. */
export const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CommandEmpty({ className, children, ...rest }, ref) {
    const { listRef, query } = useCommand("CommandEmpty");
    const [empty, setEmpty] = React.useState(false);

    React.useEffect(() => {
      const items = listRef.current?.querySelectorAll(ITEM_SELECTOR);
      setEmpty((items?.length ?? 0) === 0);
    }, [query, listRef, children]);

    if (!empty) return null;
    return (
      <div ref={ref} className={cn("lui-command-empty", className)} {...rest}>
        {children ?? "Geen resultaten gevonden."}
      </div>
    );
  }
);

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}

export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
  { heading, className, children, ...rest },
  ref
) {
  const { query } = useCommand("CommandGroup");
  const inner = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    const items = inner.current?.querySelectorAll(ITEM_SELECTOR);
    setVisible((items?.length ?? 0) > 0);
  }, [query, children]);

  return (
    <div
      ref={(node) => {
        inner.current = node;
        if (typeof ref === "function") ref(node as HTMLDivElement);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      role="group"
      hidden={!visible || undefined}
      className={cn("lui-command-group", className)}
      {...rest}
    >
      {heading && <div className="lui-command-group-heading">{heading}</div>}
      {children}
    </div>
  );
});

export interface CommandItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Tekst waarop gefilterd wordt (standaard: de children als string). */
  value?: string;
  icon?: React.ReactNode;
  shortcut?: React.ReactNode;
  onSelect?: () => void;
}

export const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(function CommandItem(
  { value, icon, shortcut, onSelect, className, children, disabled, onClick, ...rest },
  ref
) {
  const { matches } = useCommand("CommandItem");
  const text = value ?? (typeof children === "string" ? children : "");
  const visible = matches(text);

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      tabIndex={-1}
      hidden={!visible || undefined}
      data-lui-command-item=""
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      className={cn("lui-command-item", className)}
      onMouseEnter={(event) => {
        const list = event.currentTarget.closest(".lui-command-list");
        list?.querySelectorAll("[data-active]").forEach((node) => node.removeAttribute("data-active"));
        event.currentTarget.setAttribute("data-active", "");
      }}
      onClick={(event) => {
        onClick?.(event);
        onSelect?.();
      }}
      {...rest}
    >
      {icon && <span className="lui-command-item-icon">{icon}</span>}
      <span className="lui-command-item-label">{children}</span>
      {shortcut && <span className="lui-command-item-shortcut">{shortcut}</span>}
    </button>
  );
});

export const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CommandSeparator({ className, ...rest }, ref) {
    return <div ref={ref} role="separator" className={cn("lui-command-separator", className)} {...rest} />;
  }
);

export const CommandFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CommandFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-command-footer", className)} {...rest} />;
  }
);

export interface CommandDialogProps extends CommandProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Opent automatisch met ⌘K / Ctrl+K. */
  shortcut?: boolean;
}

/** CommandDialog — het palet in een modaal venster, met ⌘K-sneltoets. */
export function CommandDialog({
  open,
  onOpenChange,
  shortcut = true,
  children,
  ...commandProps
}: CommandDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // De listener mag niet bij elke render opnieuw aangehangen worden, maar moet
  // wel de actuele staat zien. Vandaar een ref, zoals in useEscapeKey.
  const wissel = React.useRef<() => void>(() => undefined);
  wissel.current = () => setOpen(!isOpen);

  React.useEffect(() => {
    if (!shortcut) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        wissel.current();
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [shortcut]);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent size="lg" hideClose className="lui-command-dialog">
        <Command {...commandProps}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}
