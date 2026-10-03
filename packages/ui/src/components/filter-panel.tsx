"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

export interface FilterPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  /** Aantal actieve filters; toont de wisknop zodra het meer dan nul is. */
  activeCount?: number;
  /** Wist alle filters. */
  onClear?: () => void;
  clearLabel?: string;
  /** Donkere rail, zoals de ingeklapte Sidebar. */
  tone?: "surface" | "inverted";
}

export interface FilterGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onToggle"> {
  label: React.ReactNode;
  /** Inklapbaar maken. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Toont zoveel opties en zet de rest achter "toon meer". */
  maxVisible?: number;
  moreLabel?: string;
  lessLabel?: string;
}

export interface FilterOptionProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: React.ReactNode;
  /** Vinkje of bolletje. */
  type?: "checkbox" | "radio";
  checked?: boolean;
  /** Deels aangevinkt, bv. een groep met een deel van de kinderen aan. */
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Aantal resultaten rechts. */
  count?: number;
  /** Avatar of icoontje voor het label. */
  lead?: React.ReactNode;
}

/** FilterPanel — kolom met filtergroepen, met een kop en een wisknop. */
export const FilterPanel = React.forwardRef<HTMLDivElement, FilterPanelProps>(function FilterPanel(
  { title, activeCount = 0, onClear, clearLabel = "Wissen", tone = "surface", className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} data-tone={tone} className={cn("lui-filter", className)} {...rest}>
      {(title || (activeCount > 0 && onClear)) && (
        <div className="lui-filter-head">
          <span className="lui-filter-title">
            {title}
            {activeCount > 0 && <span className="lui-filter-count">{activeCount}</span>}
          </span>
          {activeCount > 0 && onClear && (
            <button type="button" className="lui-filter-clear" onClick={onClear}>
              {clearLabel}
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
});

/** Eén groep filters, eventueel inklapbaar en met "toon meer". */
export const FilterGroup = React.forwardRef<HTMLDivElement, FilterGroupProps>(function FilterGroup(
  {
    label,
    collapsible,
    defaultOpen = true,
    open,
    onOpenChange,
    maxVisible,
    moreLabel = "Toon meer",
    lessLabel = "Toon minder",
    className,
    children,
    ...rest
  },
  ref
) {
  const [uitgeklapt, setUitgeklapt] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [alles, setAlles] = React.useState(false);

  const items = React.Children.toArray(children);
  const verborgen = maxVisible !== undefined && items.length > maxVisible && !alles;
  const zichtbaar = verborgen ? items.slice(0, maxVisible) : items;

  return (
    <div ref={ref} data-open={uitgeklapt ? "" : undefined} className={cn("lui-filter-group", className)} {...rest}>
      {collapsible ? (
        <button
          type="button"
          className="lui-filter-group-label"
          aria-expanded={uitgeklapt}
          onClick={() => setUitgeklapt(!uitgeklapt)}
        >
          {label}
          <Icon name="chevronDown" size={15} className="lui-filter-chevron" />
        </button>
      ) : (
        <div className="lui-filter-group-label">{label}</div>
      )}

      {(!collapsible || uitgeklapt) && (
        <div className="lui-filter-items">
          {zichtbaar}
          {maxVisible !== undefined && items.length > maxVisible && (
            <button type="button" className="lui-filter-more" onClick={() => setAlles((vorig) => !vorig)}>
              {alles ? lessLabel : `${moreLabel} (${items.length - maxVisible})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

/** Eén filteroptie: vinkje of bolletje, met tellertje en optioneel een avatar. */
export const FilterOption = React.forwardRef<HTMLInputElement, FilterOptionProps>(
  function FilterOption(
    { label, type = "checkbox", checked, indeterminate, onCheckedChange, count, lead, className, disabled, ...rest },
    ref
  ) {
    const eigen = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (eigen.current) eigen.current.indeterminate = Boolean(indeterminate);
    }, [indeterminate]);

    return (
      <label className={cn("lui-filter-option", className)} data-disabled={disabled ? "" : undefined}>
        <input
          ref={(node) => {
            eigen.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
          }}
          type={type}
          className="lui-filter-input"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          {...rest}
        />
        <span className="lui-filter-box" aria-hidden="true">
          <Icon name={indeterminate ? "minus" : "check"} size={12} strokeWidth={3} />
        </span>
        {lead && <span className="lui-filter-lead">{lead}</span>}
        <span className="lui-filter-label">{label}</span>
        {count !== undefined && <span className="lui-filter-badge">{count}</span>}
      </label>
    );
  }
);
