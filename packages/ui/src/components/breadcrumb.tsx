"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Slot, slotChildren } from "../lib/slot";
import { Icon } from "../icons/icon";

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode;
}

/** Breadcrumb — kruimelpad met scheidingstekens. */
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { separator, className, children, ...rest },
  ref
) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <nav ref={ref} aria-label="Kruimelpad" className={cn("lui-breadcrumb", className)} {...rest}>
      <ol className="lui-breadcrumb-list">
        {items.map((item, index) => (
          <li className="lui-breadcrumb-entry" key={index}>
            {item}
            {index < items.length - 1 && (
              <span className="lui-breadcrumb-separator" aria-hidden="true">
                {separator ?? <Icon name="chevronRight" size={14} />}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

export interface BreadcrumbItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Laatste item: geen link, sterker gekleurd. */
  current?: boolean;
  asChild?: boolean;
  icon?: React.ReactNode;
}

export const BreadcrumbItem = React.forwardRef<HTMLAnchorElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ current, asChild, icon, className, children, ...rest }, ref) {
    if (current) {
      return (
        <span className={cn("lui-breadcrumb-item", "lui-breadcrumb-current", className)} aria-current="page">
          {icon}
          {children}
        </span>
      );
    }
    const Comp = (asChild ? Slot : "a") as React.ElementType;
    const slot = slotChildren(asChild, children);
    return (
      <Comp ref={ref} className={cn("lui-breadcrumb-item", className)} {...rest}>
        {slot.wrap(
          <>
            {icon}
            {slot.inner}
          </>
        )}
      </Comp>
    );
  }
);
