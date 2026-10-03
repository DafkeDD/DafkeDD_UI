"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface WorkspaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Breedte van de linkerkolom; weglaten = geen linkerrail. */
  left?: number | string;
  /** Breedte van de rechterkolom. */
  right?: number | string;
  /** Ruimte tussen de kolommen. */
  gap?: number;
  /**
   * Breedte waaronder de kolommen onder elkaar komen. Dit kijkt naar de breedte
   * van het werkblad zelf (container query), niet naar het scherm — zo klopt het
   * ook wanneer het werkblad in een smallere kolom staat.
   */
  stackAt?: number;
}

/**
 * Workspace — werkblad met een smalle rail links en/of rechts naast de inhoud.
 * Onder het breekpunt stapelen de kolommen: eerst de inhoud, dan de rails.
 */
export const Workspace = React.forwardRef<HTMLDivElement, WorkspaceProps>(function Workspace(
  { left, right, gap = 20, stackAt = 1000, className, style, children, ...rest },
  ref
) {
  const columns = [
    left ? size(left) : null,
    "minmax(0, 1fr)",
    right ? size(right) : null,
  ].filter(Boolean) as string[];

  // Het breekpunt is een prop, dus de query hoort bij deze ene instantie.
  // Zo blijft het stapelen pure CSS: geen flits bij het laden, geen meting in JS.
  const scope = `luiws${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div
      className={cn("lui-workspace-container", className)}
      style={{ containerType: "inline-size", containerName: scope }}
    >
      <style>
        {`@container ${scope} (max-width:${stackAt}px){` +
          `.${scope}-grid{grid-template-columns:minmax(0,1fr)!important}` +
          `.${scope}-grid>*{order:var(--lui-stack-order,0)}` +
          `.${scope}-grid .lui-workspace-rail{position:static}}`}
      </style>
      <div
        ref={ref}
        className={cn("lui-workspace", `${scope}-grid`)}
        style={{ ...style, gap, gridTemplateColumns: columns.join(" ") }}
        {...rest}
      >
        {children}
      </div>
    </div>
  );
});

function size(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export interface WorkspaceRailProps extends React.HTMLAttributes<HTMLElement> {
  side?: "left" | "right";
  /** Blijft meescrollen tot deze afstand van de bovenkant. */
  sticky?: boolean | number;
  /** Volgorde na het stapelen (lager komt hoger te staan). */
  stackOrder?: number;
}

/** WorkspaceRail — smalle kolom naast de inhoud, standaard sticky. */
export const WorkspaceRail = React.forwardRef<HTMLElement, WorkspaceRailProps>(function WorkspaceRail(
  { side = "left", sticky = true, stackOrder = 0, className, style, ...rest },
  ref
) {
  const offset = typeof sticky === "number" ? sticky : 20;

  return (
    <aside
      ref={ref}
      className={cn(
        "lui-workspace-rail",
        `lui-workspace-rail-${side}`,
        sticky && "lui-workspace-sticky",
        className
      )}
      style={
        {
          ...style,
          top: sticky ? offset : undefined,
          ["--lui-stack-order" as string]: stackOrder,
        } as React.CSSProperties
      }
      {...rest}
    />
  );
});

export interface WorkspaceMainProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Volgorde na het stapelen; standaard bovenaan. */
  stackOrder?: number;
}

/** WorkspaceMain — de brede middenkolom. */
export const WorkspaceMain = React.forwardRef<HTMLDivElement, WorkspaceMainProps>(
  function WorkspaceMain({ stackOrder = -1, className, style, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={cn("lui-workspace-main", className)}
        style={{ ...style, ["--lui-stack-order" as string]: stackOrder } as React.CSSProperties}
        {...rest}
      />
    );
  }
);

/** WorkspacePanel — blok binnen een rail: kaartje met een SectionHeader erboven. */
export const WorkspacePanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function WorkspacePanel({ className, ...rest }, ref) {
    return <div ref={ref} className={cn("lui-workspace-panel", className)} {...rest} />;
  }
);
