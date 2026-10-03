"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

interface TreeContextValue {
  open: string[];
  toggle: (value: string) => void;
  selected: string | undefined;
  select: (value: string) => void;
  registreer: (value: string) => void;
  volgorde: React.RefObject<string[]>;
  focus: (value: string) => void;
}

const TreeContext = React.createContext<TreeContextValue | null>(null);
const NiveauContext = React.createContext(1);

export interface TreeProps extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  /** Welke takken openstaan (controlled). */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Welk item geselecteerd is (controlled). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Lijnen langs de inspringing. */
  guides?: boolean;
  dense?: boolean;
}

export interface TreeItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "onSelect"> {
  /** Unieke sleutel van dit item. */
  value: string;
  label: React.ReactNode;
  /** Icoon voor het label; standaard een map of bestand. */
  icon?: React.ReactNode;
  /** Tekst of badge helemaal rechts. */
  trailing?: React.ReactNode;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

function useTree(waar: string) {
  const context = React.useContext(TreeContext);
  if (!context) throw new Error(`${waar} moet binnen <Tree> staan.`);
  return context;
}

/**
 * Tree — hiërarchische lijst met in- en uitklapbare takken. Pijltjestoetsen
 * lopen door de zichtbare items, links en rechts klappen open en dicht.
 */
export const Tree = React.forwardRef<HTMLUListElement, TreeProps>(function Tree(
  {
    expanded,
    defaultExpanded = [],
    onExpandedChange,
    value,
    defaultValue,
    onValueChange,
    guides = true,
    dense,
    className,
    children,
    ...rest
  },
  ref
) {
  const [open, setOpen] = useControllableState<string[]>({
    value: expanded,
    defaultValue: defaultExpanded,
    onChange: onExpandedChange,
  });
  const [selected, setSelected] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  });

  const volgorde = React.useRef<string[]>([]);
  const host = React.useRef<HTMLUListElement | null>(null);

  // De volgorde wordt elke render opnieuw opgebouwd door de items zelf.
  volgorde.current = [];

  const context = React.useMemo<TreeContextValue>(
    () => ({
      open,
      toggle: (sleutel) =>
        setOpen((vorige) =>
          vorige.includes(sleutel) ? vorige.filter((x) => x !== sleutel) : [...vorige, sleutel]
        ),
      selected,
      select: setSelected,
      registreer: (sleutel) => {
        if (!volgorde.current.includes(sleutel)) volgorde.current.push(sleutel);
      },
      volgorde,
      focus: (sleutel) => {
        const node = host.current?.querySelector<HTMLElement>(`[data-tree-value="${CSS.escape(sleutel)}"]`);
        node?.focus();
      },
    }),
    [open, selected, setOpen, setSelected]
  );

  return (
    <TreeContext.Provider value={context}>
      <ul
        ref={(node) => {
          host.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.RefObject<HTMLUListElement | null>).current = node;
        }}
        role="tree"
        data-guides={guides ? "" : undefined}
        data-dense={dense ? "" : undefined}
        className={cn("lui-tree", className)}
        {...rest}
      >
        {children}
      </ul>
    </TreeContext.Provider>
  );
});

/** Eén tak of blad. Kinderen maken er vanzelf een tak van. */
export const TreeItem = React.forwardRef<HTMLLIElement, TreeItemProps>(function TreeItem(
  { value, label, icon, trailing, disabled, onSelect, className, children, ...rest },
  ref
) {
  const tree = useTree("TreeItem");
  const niveau = React.useContext(NiveauContext);
  const tak = React.Children.count(children) > 0;
  const open = tree.open.includes(value);
  const geselecteerd = tree.selected === value;

  tree.registreer(value);

  const ganaar = (richting: 1 | -1) => {
    const lijst = tree.volgorde.current;
    const index = lijst.indexOf(value);
    const doel = lijst[index + richting];
    if (doel) tree.focus(doel);
  };

  const opToets = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        ganaar(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        ganaar(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        if (tak && !open) tree.toggle(value);
        else if (tak) ganaar(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (tak && open) tree.toggle(value);
        else ganaar(-1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        tree.select(value);
        onSelect?.(value);
        if (tak) tree.toggle(value);
        break;
      default:
        break;
    }
  };

  return (
    <li
      ref={ref}
      role="treeitem"
      aria-expanded={tak ? open : undefined}
      aria-selected={geselecteerd || undefined}
      aria-level={niveau}
      aria-disabled={disabled || undefined}
      className={cn("lui-tree-item", className)}
      {...rest}
    >
      <div
        data-tree-value={value}
        tabIndex={disabled ? -1 : 0}
        data-selected={geselecteerd ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        className="lui-tree-row"
        style={{ paddingInlineStart: `${(niveau - 1) * 18 + 8}px` }}
        onKeyDown={opToets}
        onClick={() => {
          if (disabled) return;
          tree.select(value);
          onSelect?.(value);
          if (tak) tree.toggle(value);
        }}
      >
        <span className="lui-tree-chevron" data-open={open ? "" : undefined} aria-hidden="true">
          {tak ? <Icon name="chevronRight" size={14} /> : null}
        </span>
        <span className="lui-tree-icon" aria-hidden="true">
          {icon ?? <Icon name={tak ? "folder" : "file"} size={15} />}
        </span>
        <span className="lui-tree-label">{label}</span>
        {trailing && <span className="lui-tree-trailing">{trailing}</span>}
      </div>

      {tak && open && (
        <NiveauContext.Provider value={niveau + 1}>
          <ul role="group" className="lui-tree-group">
            {children}
          </ul>
        </NiveauContext.Provider>
      )}
    </li>
  );
});
