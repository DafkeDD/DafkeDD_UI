"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

interface ShellContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const ShellContext = React.createContext<ShellContextValue | null>(null);

/** Toegang tot de staat van de app-shell (ingeklapt / mobiel menu). */
export function useShell(): ShellContextValue {
  const context = React.useContext(ShellContext);
  if (!context) throw new Error("useShell() vereist een <AppShell> hoger in de boom.");
  return context;
}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** AppShell — layout met vaste zijbalk en scrollende inhoud. */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { defaultCollapsed = false, collapsed, onCollapsedChange, className, children, ...rest },
  ref
) {
  const [internal, setInternal] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isCollapsed = collapsed ?? internal;

  const setCollapsed = (next: boolean) => {
    if (collapsed === undefined) setInternal(next);
    onCollapsedChange?.(next);
  };

  return (
    <ShellContext.Provider value={{ collapsed: isCollapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <div
        ref={ref}
        className={cn("lui-shell", isCollapsed && "lui-shell-collapsed", className)}
        {...rest}
      >
        {children}
        <div
          className={cn("lui-shell-backdrop", mobileOpen && "lui-shell-backdrop-open")}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      </div>
    </ShellContext.Provider>
  );
});

export const AppMain = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AppMain({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-shell-main", className)} {...rest} />;
  }
);

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Verbergt de hamburgerknop op mobiel. */
  hideMenuButton?: boolean;
}

/** Topbar — plakkende bovenbalk met menuknop op mobiel. */
export const Topbar = React.forwardRef<HTMLElement, TopbarProps>(function Topbar(
  { hideMenuButton, className, children, ...rest },
  ref
) {
  const shell = React.useContext(ShellContext);

  return (
    <header ref={ref} className={cn("lui-topbar", className)} {...rest}>
      {!hideMenuButton && shell && (
        <button
          type="button"
          className="lui-topbar-menu"
          aria-label="Menu openen"
          onClick={() => shell.setMobileOpen(true)}
        >
          <Icon name="menu" size={20} />
        </button>
      )}
      {children}
    </header>
  );
});

export const TopbarSpacer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TopbarSpacer({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-topbar-spacer", className)} {...rest} />;
  }
);

export interface TopbarSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Sneltoets rechts in het veld, bv. "⌘K". */
  shortcut?: React.ReactNode;
}

export const TopbarSearch = React.forwardRef<HTMLInputElement, TopbarSearchProps>(
  function TopbarSearch({ shortcut, className, placeholder = "Zoeken…", ...rest }, ref) {
    return (
      <div className={cn("lui-topbar-search", className)}>
        <Icon name="search" size={16} />
        <input ref={ref} placeholder={placeholder} {...rest} />
        {shortcut && <span className="lui-topbar-kbd">{shortcut}</span>}
      </div>
    );
  }
);

export interface ContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Volle breedte in plaats van de standaard maximumbreedte. */
  wide?: boolean;
}

/** Content — gecentreerde inhoudskolom met binnenmarge. */
export const Content = React.forwardRef<HTMLElement, ContentProps>(function Content(
  { wide, className, ...rest },
  ref
) {
  return <main ref={ref} className={cn("lui-content", wide && "lui-content-wide", className)} {...rest} />;
});

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Knoppen rechts van de titel. */
  actions?: React.ReactNode;
  /** Kruimelpad boven de titel. */
  breadcrumb?: React.ReactNode;
}

/** PageHeader — titel, omschrijving en acties bovenaan een pagina. */
export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { title, description, actions, breadcrumb, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-page-header", className)} {...rest}>
      {breadcrumb && <div className="lui-page-breadcrumb">{breadcrumb}</div>}
      <div className="lui-page-header-row">
        <div className="lui-page-header-text">
          <h1 className="lui-page-title">{title}</h1>
          {description && <p className="lui-page-description">{description}</p>}
        </div>
        {actions && <div className="lui-page-actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
});
