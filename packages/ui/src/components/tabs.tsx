"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";

interface TabsContextValue {
  value: string | undefined;
  setValue: (value: string) => void;
  variant: "line" | "pill" | "solid";
  baseId: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error(`<${component}> moet binnen <Tabs> staan.`);
  return context;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: "line" | "pill" | "solid";
}

/** Tabs — tabbladen met pijltjesnavigatie (line, pill of solid). */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue, onValueChange, variant = "line", className, children, ...rest },
  ref
) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });
  const baseId = React.useId();

  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent, variant, baseId }}>
      <div ref={ref} className={cn("lui-tabs", className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TabsList({ className, children, onKeyDown, ...rest }, ref) {
    const { variant, value } = useTabs("TabsList");
    const inner = React.useRef<HTMLDivElement | null>(null);
    // Eén indicator die naar het actieve tabblad glijdt, in plaats van een
    // rand of achtergrond die per tabblad aan- en uitspringt.
    const [balk, setBalk] = React.useState<{ x: number; w: number; klaar: boolean } | null>(null);

    React.useEffect(() => {
      const lijst = inner.current;
      if (!lijst) return;
      const meet = () => {
        const actief = lijst.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
        if (!actief) {
          setBalk(null);
          return;
        }
        setBalk((vorig) => ({ x: actief.offsetLeft, w: actief.offsetWidth, klaar: vorig !== null }));
      };
      meet();
      const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(meet) : null;
      observer?.observe(lijst);
      lijst.querySelectorAll('[role="tab"]').forEach((tab) => observer?.observe(tab));
      return () => observer?.disconnect();
    }, [value]);

    return (
      <div
        ref={(node) => {
          inner.current = node;
          if (typeof ref === "function") ref(node as HTMLDivElement);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        role="tablist"
        data-indicator={balk ? "" : undefined}
        className={cn("lui-tabs-list", `lui-tabs-list-${variant}`, className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          const tabs = Array.from(
            inner.current?.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])') ?? []
          );
          const index = tabs.indexOf(document.activeElement as HTMLElement);
          if (index === -1) return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            tabs[(index + 1) % tabs.length].focus();
            tabs[(index + 1) % tabs.length].click();
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            const previous = tabs[(index - 1 + tabs.length) % tabs.length];
            previous.focus();
            previous.click();
          }
        }}
        {...rest}
      >
        {balk && (
          <span
            className="lui-tabs-indicator"
            aria-hidden="true"
            data-ready={balk.klaar ? "" : undefined}
            style={{ width: balk.w, transform: `translateX(${balk.x}px)` }}
          />
        )}
        {children}
      </div>
    );
  }
);

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  /** Telling of status rechts van het label. */
  badge?: React.ReactNode;
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
  { value, icon, badge, className, children, disabled, ...rest },
  ref
) {
  const { value: current, setValue, baseId } = useTabs("TabsTrigger");
  const active = current === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-controls={`${baseId}-panel-${value}`}
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      data-state={active ? "active" : "inactive"}
      className={cn("lui-tab", className)}
      onClick={() => setValue(value)}
      {...rest}
    >
      {icon && <span className="lui-tab-icon">{icon}</span>}
      {children}
      {badge !== undefined && <span className="lui-tab-badge">{badge}</span>}
    </button>
  );
});

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Houdt de inhoud gemonteerd wanneer het tabblad niet actief is. */
  keepMounted?: boolean;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
  { value, keepMounted, className, children, ...rest },
  ref
) {
  const { value: current, baseId } = useTabs("TabsContent");
  const active = current === value;
  if (!active && !keepMounted) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      hidden={!active || undefined}
      tabIndex={0}
      className={cn("lui-tabs-content", className)}
      {...rest}
    >
      {children}
    </div>
  );
});
