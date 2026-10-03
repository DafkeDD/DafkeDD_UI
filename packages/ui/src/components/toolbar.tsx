"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md";
  /** Rand en achtergrond rond de balk. */
  bordered?: boolean;
  orientation?: "horizontal" | "vertical";
}

/** Toolbar — knoppenrij met groepen en scheidingslijnen (opmaak, filters, acties). */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { size = "md", bordered = true, orientation = "horizontal", className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-orientation={orientation}
      className={cn(
        "lui-toolbar",
        `lui-toolbar-${size}`,
        `lui-toolbar-${orientation}`,
        bordered && "lui-toolbar-bordered",
        className
      )}
      {...rest}
    />
  );
});

/** Groep knoppen die bij elkaar horen. */
export const ToolbarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ToolbarGroup({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-toolbar-group", className)} {...rest} />;
  }
);

export const ToolbarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ToolbarSeparator({ className, ...rest }, ref) {
    return (
      <div ref={ref} role="separator" className={cn("lui-toolbar-separator", className)} {...rest} />
    );
  }
);

/** Duwt alles erna naar de rechterkant van de balk. */
export const ToolbarSpacer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function ToolbarSpacer({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-toolbar-spacer", className)} {...rest} />;
  }
);

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ingedrukte staat, bv. vet of cursief dat aan staat. */
  active?: boolean;
  label?: string;
}

/** ToolbarButton — compacte knop met aan/uit-staat. */
export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton({ active, label, className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        data-active={active ? "" : undefined}
        aria-label={label}
        title={label}
        className={cn("lui-toolbar-btn", className)}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
