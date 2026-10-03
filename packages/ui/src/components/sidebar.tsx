"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, slotChildren } from "../lib/slot";
import { Icon } from "../icons/icon";
import { useShell } from "./app-shell";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Verbergt de inklapknop onderaan. */
  hideCollapse?: boolean;
  /**
   * "surface" volgt de achtergrond van de app (standaard).
   * "inverted" geeft een donkere, teal-getinte rail — ook in lichtmodus.
   */
  tone?: "surface" | "inverted";
}

/** Sidebar — vaste navigatiekolom; op mobiel een uitschuifbaar paneel. */
export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { hideCollapse, tone = "surface", className, children, ...rest },
  ref
) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useShell();

  return (
    <aside
      ref={ref}
      className={cn("lui-sidebar", mobileOpen && "lui-sidebar-open", className)}
      data-collapsed={collapsed ? "" : undefined}
      data-tone={tone === "inverted" ? "inverted" : undefined}
      {...rest}
    >
      <button
        type="button"
        className="lui-sidebar-mobile-close"
        aria-label="Menu sluiten"
        onClick={() => setMobileOpen(false)}
      >
        <Icon name="x" size={18} />
      </button>
      {children}
      {!hideCollapse && (
        <button
          type="button"
          className="lui-sidebar-collapse"
          aria-label={collapsed ? "Zijbalk uitklappen" : "Zijbalk inklappen"}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Icon name={collapsed ? "chevronsRight" : "chevronsLeft"} size={17} />
          <span className="lui-sidebar-label">Inklappen</span>
        </button>
      )}
    </aside>
  );
});

export interface SidebarBrandProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logo of merkteken links. */
  logo?: React.ReactNode;
  name: React.ReactNode;
  subtitle?: React.ReactNode;
}

export const SidebarBrand = React.forwardRef<HTMLDivElement, SidebarBrandProps>(function SidebarBrand(
  { logo, name, subtitle, className, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-sidebar-brand", className)} {...rest}>
      {logo && <span className="lui-sidebar-mark">{logo}</span>}
      <span className="lui-sidebar-brand-text lui-sidebar-label">
        <span className="lui-sidebar-brand-name">{name}</span>
        {subtitle && <span className="lui-sidebar-brand-sub">{subtitle}</span>}
      </span>
    </div>
  );
});

export const SidebarNav = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function SidebarNav({ className, ...rest }, ref) {
    return <nav ref={ref} className={cn("lui-sidebar-nav", className)} {...rest} />;
  }
);

export const SidebarSection = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarSection({ className, children, ...rest }, ref) {
    return (
      <div ref={ref} className={cn("lui-sidebar-section lui-sidebar-label", className)} {...rest}>
        {children}
      </div>
    );
  }
);

export interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  active?: boolean;
  /** Telling of status rechts. */
  badge?: React.ReactNode;
  asChild?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(function SidebarItem(
  { icon, active, badge, asChild, className, children, ...rest },
  ref
) {
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  const slot = slotChildren(asChild, children);

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : "button"}
      aria-current={active ? "page" : undefined}
      data-active={active ? "" : undefined}
      className={cn("lui-sidebar-item", className)}
      {...rest}
    >
      {slot.wrap(
        <>
          {icon && <span className="lui-sidebar-item-icon">{icon}</span>}
          <span className="lui-sidebar-item-label lui-sidebar-label">{slot.inner}</span>
          {badge !== undefined && <span className="lui-sidebar-item-badge lui-sidebar-label">{badge}</span>}
        </>
      )}
    </Comp>
  );
});

export const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-sidebar-footer", className)} {...rest} />;
  }
);
