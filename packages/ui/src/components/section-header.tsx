"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export type SectionTone = "accent" | "green" | "amber" | "red" | "blue" | "violet" | "neutral";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  /** Kleur van het staafje links. */
  tone?: SectionTone;
  /** Telling of korte toevoeging achter de titel. */
  count?: React.ReactNode;
  /** Uitleg onder de titel. */
  description?: React.ReactNode;
  /** Knoppen of badges rechts. */
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  /** Lijn onder de kop over de volle breedte. */
  divider?: boolean;
}

/**
 * SectionHeader — compacte kop boven een blok binnen een pagina of kaart.
 * Het gekleurde staafje maakt in één oogopslag duidelijk waar je zit.
 */
export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  function SectionHeader(
    { title, tone = "accent", count, description, actions, icon, size = "md", divider, className, ...rest },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          "lui-section-header",
          `lui-section-header-${size}`,
          `lui-section-${tone}`,
          divider && "lui-section-header-divider",
          className
        )}
        {...rest}
      >
        <span className="lui-section-bar" aria-hidden="true" />
        {icon && <span className="lui-section-icon">{icon}</span>}
        <div className="lui-section-text">
          <h3 className="lui-section-title">
            {title}
            {count != null && <span className="lui-section-count">· {count}</span>}
          </h3>
          {description && <p className="lui-section-description">{description}</p>}
        </div>
        {actions && <div className="lui-section-actions">{actions}</div>}
      </div>
    );
  }
);
