"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, slotChildren } from "../lib/slot";

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Toont de balk ook op grote schermen; standaard alleen onder 860px. */
  always?: boolean;
  /** Houdt ruimte vrij voor de homebalk van iOS (standaard aan). */
  safeArea?: boolean;
  /**
   * Hoe het actieve item eruit springt: "line" is het streepje erboven,
   * "bubble" tilt het icoon in een gekleurde bol boven de balk uit.
   */
  indicator?: "line" | "bubble" | "none";
}

/**
 * BottomNav — vaste navigatiebalk onderaan op mobiel.
 * Zet in je layout `padding-bottom` gelijk aan `var(--lui-bottomnav-h)`,
 * zodat de laatste inhoud niet onder de balk verdwijnt.
 */
export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(function BottomNav(
  { always, safeArea = true, indicator = "line", className, children, ...rest },
  ref
) {
  return (
    <nav
      ref={ref}
      className={cn("lui-bottomnav", className)}
      data-always={always ? "" : undefined}
      data-safe={safeArea ? "" : undefined}
      data-indicator={indicator}
      {...rest}
    >
      {children}
    </nav>
  );
});

export interface BottomNavItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  active?: boolean;
  /** Telling of stip rechtsboven het icoon. `true` toont een stip. */
  badge?: React.ReactNode | true;
  asChild?: boolean;
}

export const BottomNavItem = React.forwardRef<HTMLButtonElement, BottomNavItemProps>(function BottomNavItem(
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
      className={cn("lui-bottomnav-item", className)}
      {...rest}
    >
      {slot.wrap(
        <>
      <span className="lui-bottomnav-icon">
        <span className="lui-bottomnav-bubble" aria-hidden="true" />
        {icon}
        {badge !== undefined && badge !== false && (
          <span className={cn("lui-bottomnav-badge", badge === true && "lui-bottomnav-dot")}>
            {badge === true ? null : badge}
          </span>
        )}
      </span>
      <span className="lui-bottomnav-label">{slot.inner}</span>
        </>
      )}
    </Comp>
  );
});
