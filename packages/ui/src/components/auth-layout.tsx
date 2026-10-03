"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * "split" zet een gekleurd paneel naast het formulier (verdwijnt op mobiel),
   * "centered" zet de kaart midden op een zachte achtergrond.
   */
  variant?: "split" | "centered";
  /** Inhoud van het zijpaneel bij `split`. */
  aside?: React.ReactNode;
  /** Donker paneel in plaats van het accentverloop. */
  asideTone?: "accent" | "ink";
  /** Zijpaneel links of rechts. */
  asidePosition?: "left" | "right";
}

/**
 * AuthLayout — het frame rond een aanmeldscherm. Split zet een merkpaneel naast
 * het formulier, centered zet de kaart midden op het scherm met een zachte gloed.
 */
export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(function AuthLayout(
  { variant = "split", aside, asideTone = "accent", asidePosition = "left", className, children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-auth", `lui-auth-${variant}`, `lui-auth-aside-${asidePosition}`, className)}
      {...rest}
    >
      {variant === "split" && aside && (
        <aside className={cn("lui-auth-aside", `lui-auth-aside-${asideTone}`)}>
          <span className="lui-auth-deco" aria-hidden="true" />
          <span className="lui-auth-grid" aria-hidden="true" />
          <div className="lui-auth-aside-inner">{aside}</div>
        </aside>
      )}

      <main className="lui-auth-main">
        {variant === "centered" && (
          <>
            <span className="lui-auth-glow" aria-hidden="true" />
            <span className="lui-auth-glow lui-auth-glow-two" aria-hidden="true" />
          </>
        )}
        {children}
      </main>
    </div>
  );
});

export interface AuthCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Merknaam en logo bovenaan. */
  brand?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Inhoud onder de kaart, bv. "Nog geen account?". */
  footer?: React.ReactNode;
  /** Rendert een <form> in plaats van een <div>. */
  as?: "div" | "form";
}

/** AuthCard — de kaart met titel, formulier en voettekst. */
export const AuthCard = React.forwardRef<HTMLElement, AuthCardProps>(function AuthCard(
  { brand, title, description, footer, as = "form", className, children, ...rest },
  ref
) {
  const Comp = as as React.ElementType;

  return (
    <Comp ref={ref} className={cn("lui-auth-card", className)} {...rest}>
      {brand && <div className="lui-auth-brand">{brand}</div>}
      <h1 className="lui-auth-title">{title}</h1>
      {description && <p className="lui-auth-description">{description}</p>}
      <div className="lui-auth-body">{children}</div>
      {footer && <div className="lui-auth-footer">{footer}</div>}
    </Comp>
  );
});

export interface AuthDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/** AuthDivider — "of met e-mail"-scheiding tussen SSO en formulier. */
export const AuthDivider = React.forwardRef<HTMLDivElement, AuthDividerProps>(function AuthDivider(
  { className, children = "of", ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-auth-divider", className)} {...rest}>
      <span>{children}</span>
    </div>
  );
});

export interface SsoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Logo of icoon links. */
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** Kleine regel onder het label. */
  description?: React.ReactNode;
  /** Toont een spinner en blokkeert de knop. */
  loading?: boolean;
  loadingLabel?: React.ReactNode;
  /** Merkkleur van de aanbieder, bv. de itsme®-oranje. */
  color?: string;
}

/** SsoButton — brede knop voor eID, itsme® of een andere aanbieder. */
export const SsoButton = React.forwardRef<HTMLButtonElement, SsoButtonProps>(function SsoButton(
  { icon, label, description, loading, loadingLabel = "Aanmelden…", color, className, style, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      data-loading={loading ? "" : undefined}
      className={cn("lui-sso", className)}
      style={color ? ({ ["--lui-sso-color" as string]: color, ...style } as React.CSSProperties) : style}
      {...rest}
    >
      <span className="lui-sso-icon">
        {loading ? <Icon name="loader" size={18} className="lui-sso-spin" /> : icon}
      </span>
      <span className="lui-sso-text">
        <span className="lui-sso-label">{loading ? loadingLabel : label}</span>
        {description && !loading && <span className="lui-sso-description">{description}</span>}
      </span>
      {!loading && <Icon name="chevronRight" size={17} className="lui-sso-arrow" />}
    </button>
  );
});
