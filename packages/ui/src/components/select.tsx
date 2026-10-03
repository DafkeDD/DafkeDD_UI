"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { composeRefs } from "../lib/slot";
import { useAnchorPosition } from "../lib/anchor";
import { useControllableState, useEscapeKey, useOutsideClick, usePresence } from "../lib/hooks";
import { Icon } from "../icons/icon";

interface SelectContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  register: (value: string, label: string) => void;
  labels: Map<string, string>;
  disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect(component: string): SelectContextValue {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error(`<${component}> moet binnen <Select> staan.`);
  return context;
}

const OPTION_SELECTOR = '[data-lui-option]:not([data-disabled])';

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

/** Select — eigen listbox (geen native <select>), volledig stijlbaar. */
export function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [labels, setLabels] = React.useState<Map<string, string>>(new Map());

  const register = React.useCallback((itemValue: string, label: string) => {
    setLabels((prev) => {
      if (prev.get(itemValue) === label) return prev;
      const next = new Map(prev);
      next.set(itemValue, label);
      return next;
    });
  }, []);

  return (
    <SelectContext.Provider
      value={{
        value: current,
        setValue: (next) => {
          setCurrent(next);
          setOpen(false);
          triggerRef.current?.focus();
        },
        open,
        setOpen,
        triggerRef,
        contentRef,
        register,
        labels,
        disabled,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ size = "md", invalid, className, children, onKeyDown, ...rest }, ref) {
    const { open, setOpen, triggerRef, contentRef, disabled } = useSelect("SelectTrigger");

    return (
      <button
        ref={composeRefs(ref, triggerRef)}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        data-state={open ? "open" : "closed"}
        disabled={disabled ?? rest.disabled}
        aria-invalid={invalid || undefined}
        className={cn("lui-select-trigger", `lui-input-${size}`, invalid && "lui-input-invalid", className)}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
            window.setTimeout(() => {
              const active =
                contentRef.current?.querySelector<HTMLElement>('[data-lui-option][data-selected]') ??
                contentRef.current?.querySelector<HTMLElement>(OPTION_SELECTOR);
              active?.focus();
            }, 0);
          }
        }}
        {...rest}
      >
        {children}
        <Icon name="chevronDown" size={16} className="lui-select-caret" />
      </button>
    );
  }
);

export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

/** Toont het label van de gekozen optie, of de placeholder. */
export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(function SelectValue(
  { placeholder = "Kies…", className, ...rest },
  ref
) {
  const { value, labels } = useSelect("SelectValue");
  const label = value !== undefined ? labels.get(value) : undefined;

  return (
    <span
      ref={ref}
      className={cn("lui-select-value", label === undefined && "lui-select-placeholder", className)}
      {...rest}
    >
      {label ?? placeholder}
    </span>
  );
});

export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Zoekbalk bovenaan de lijst. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(
    {
      searchable,
      searchPlaceholder = "Zoeken…",
      emptyMessage = "Geen resultaten",
      className,
      children,
      style,
      onKeyDown,
      ...rest
    },
    ref
  ) {
    const { open, setOpen, triggerRef, contentRef } = useSelect("SelectContent");
    const [query, setQuery] = React.useState("");
    const { render: zichtbaar, state: fase } = usePresence(open, contentRef, 160);
    const position = useAnchorPosition(triggerRef, contentRef, zichtbaar, {
      side: "bottom",
      align: "start",
      offset: 5,
      matchWidth: true,
    });

    useEscapeKey(() => {
      setOpen(false);
      triggerRef.current?.focus();
    }, open);
    useOutsideClick([triggerRef as React.RefObject<HTMLElement>, contentRef], () => setOpen(false), open);

    React.useEffect(() => {
      if (!open) setQuery("");
    }, [open]);

    if (!zichtbaar) return null;

    const navigeer = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      const items = Array.from(contentRef.current?.querySelectorAll<HTMLElement>(OPTION_SELECTOR) ?? []);
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[(index + 1 + items.length) % items.length].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
      } else if (event.key === "Home") {
        event.preventDefault();
        items[0].focus();
      } else if (event.key === "End") {
        event.preventDefault();
        items[items.length - 1].focus();
      }
    };

    const filtered = searchable ? filterChildren(children, query) : children;
    const isEmpty = searchable && React.Children.count(filtered) === 0;

    return (
      <Portal>
        <div
          ref={composeRefs(ref, contentRef)}
          role="listbox" data-state={fase} data-side={position.side}
          className={cn("lui-select-content", className)}
          style={{ ...position.style, ...style, opacity: position.ready ? 1 : 0 }}
          {...rest}
          // Ná {...rest}, zodat een eigen onKeyDown de pijltjesnavigatie niet wegneemt.
          onKeyDown={navigeer}
        >
          {searchable && (
            <div className="lui-select-search">
              <Icon name="search" size={15} />
              <input
                autoFocus
                className="lui-select-search-input"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          )}
          <div className="lui-select-list">
            {isEmpty ? <div className="lui-select-empty">{emptyMessage}</div> : filtered}
          </div>
        </div>
      </Portal>
    );
  }
);

function filterChildren(children: React.ReactNode, query: string): React.ReactNode {
  if (!query.trim()) return children;
  const needle = query.toLowerCase();
  return React.Children.toArray(children).filter((child) => {
    if (!React.isValidElement(child)) return false;
    const props = child.props as { children?: React.ReactNode; value?: string };
    const text = `${typeof props.children === "string" ? props.children : ""} ${props.value ?? ""}`;
    return text.toLowerCase().includes(needle);
  });
}

export interface SelectItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(function SelectItem(
  { value, icon, description, className, children, disabled, ...rest },
  ref
) {
  const { value: selected, setValue, register } = useSelect("SelectItem");
  const isSelected = selected === value;

  React.useEffect(() => {
    register(value, typeof children === "string" ? children : String(children ?? value));
  }, [register, value, children]);

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      tabIndex={-1}
      aria-selected={isSelected}
      data-lui-option=""
      data-selected={isSelected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      disabled={disabled}
      className={cn("lui-select-item", isSelected && "lui-select-item-selected", className)}
      onClick={() => !disabled && setValue(value)}
      {...rest}
    >
      {icon && <span className="lui-select-item-icon">{icon}</span>}
      <span className="lui-select-item-text">
        <span className="lui-select-item-label">{children}</span>
        {description && <span className="lui-select-item-description">{description}</span>}
      </span>
      {isSelected && <Icon name="check" size={15} className="lui-select-item-check" />}
    </button>
  );
});

export const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SelectLabel({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-menu-label", className)} {...rest} />;
  }
);

export const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SelectSeparator({ className, ...rest }, ref) {
    return <div ref={ref} role="separator" className={cn("lui-menu-separator", className)} {...rest} />;
  }
);

export const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SelectGroup({ className, ...rest }, ref) {
    return <div ref={ref} role="group" className={cn("lui-menu-group", className)} {...rest} />;
  }
);
