"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, slotChildren } from "../lib/slot";
import { useControllableState } from "../lib/hooks";

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: "sm" | "md" | "lg";
  /** "ghost" is doorzichtig tot je hem indrukt, "outline" heeft altijd een rand. */
  variant?: "ghost" | "outline";
  icon?: React.ReactNode;
  asChild?: boolean;
}

/**
 * Toggle — knop die ingedrukt blijft staan, zoals vet of cursief in een
 * werkbalk. Voor aan/uit-instellingen gebruik je Switch.
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    size = "md",
    variant = "ghost",
    icon,
    asChild,
    className,
    children,
    onClick,
    ...rest
  },
  ref
) {
  const [aan, setAan] = useControllableState<boolean>({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  const slot = slotChildren(asChild, children);

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      aria-pressed={aan}
      data-state={aan ? "on" : "off"}
      className={cn(
        "lui-toggle",
        `lui-toggle-${size}`,
        `lui-toggle-${variant}`,
        !slot.inner && "lui-toggle-icon-only",
        className
      )}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        setAan(!aan);
      }}
      {...rest}
    >
      {slot.wrap(
        <>
          {icon && <span className="lui-toggle-icon">{icon}</span>}
          {slot.inner}
        </>
      )}
    </Comp>
  );
});

/* ------------------------------------------------------------------ */
/* ToggleGroup                                                         */
/* ------------------------------------------------------------------ */
interface ToggleGroupContextValue {
  waarden: string[];
  wissel: (value: string) => void;
  size: "sm" | "md" | "lg";
  variant: "ghost" | "outline";
  disabled?: boolean;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** "single" laat één keuze toe, "multiple" meerdere. */
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string & string[]) => void;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline";
  disabled?: boolean;
  /** Knoppen aan elkaar geplakt in plaats van los. */
  joined?: boolean;
}

/** ToggleGroup — rij toggles die samen één keuze of een set keuzes vormen. */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(function ToggleGroup(
  {
    type = "single",
    value,
    defaultValue,
    onValueChange,
    size = "md",
    variant = "ghost",
    disabled,
    joined,
    className,
    children,
    ...rest
  },
  ref
) {
  const naarLijst = (waarde: string | string[] | undefined): string[] =>
    waarde === undefined ? [] : Array.isArray(waarde) ? waarde : [waarde];

  const [waarden, setWaarden] = useControllableState<string[]>({
    value: value === undefined ? undefined : naarLijst(value),
    defaultValue: naarLijst(defaultValue),
    onChange: (volgende) => onValueChange?.((type === "single" ? (volgende[0] ?? "") : volgende) as string & string[]),
  });

  const wissel = (keuze: string) => {
    if (type === "single") {
      setWaarden(waarden.includes(keuze) ? [] : [keuze]);
      return;
    }
    setWaarden(waarden.includes(keuze) ? waarden.filter((w) => w !== keuze) : [...waarden, keuze]);
  };

  return (
    <ToggleGroupContext.Provider value={{ waarden, wissel, size, variant, disabled }}>
      <div
        ref={ref}
        role="group"
        className={cn("lui-toggle-group", joined && "lui-toggle-group-joined", className)}
        {...rest}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
});

export interface ToggleGroupItemProps extends Omit<ToggleProps, "pressed" | "defaultPressed" | "onPressedChange"> {
  value: string;
}

export const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem({ value, size, variant, disabled, ...rest }, ref) {
    const groep = React.useContext(ToggleGroupContext);
    if (!groep) throw new Error("<ToggleGroupItem> moet binnen <ToggleGroup> staan.");

    return (
      <Toggle
        ref={ref}
        pressed={groep.waarden.includes(value)}
        onPressedChange={() => groep.wissel(value)}
        size={size ?? groep.size}
        variant={variant ?? groep.variant}
        disabled={disabled ?? groep.disabled}
        {...rest}
      />
    );
  }
);
