"use client";
import * as React from "react";
import { variants } from "../lib/variants";
import { Slot, slotChildren } from "../lib/slot";
import { cn } from "../lib/cn";
import { Spinner } from "./spinner";

const button = variants({
  base: "lui-btn",
  variants: {
    variant: {
      primary: "lui-btn-primary",
      secondary: "lui-btn-secondary",
      ghost: "lui-btn-ghost",
      danger: "lui-btn-danger",
      "danger-soft": "lui-btn-danger-soft",
      link: "lui-btn-link",
    },
    size: {
      sm: "lui-btn-sm",
      md: "",
      lg: "lui-btn-lg",
    },
    block: { true: "lui-btn-block", false: "" },
    iconOnly: { true: "lui-btn-icon", false: "" },
  },
  defaultVariants: { variant: "primary", size: "md", block: false, iconOnly: false },
});

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-soft" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Volle breedte. */
  block?: boolean;
  /** Vierkante knop zonder label (icoonknop). Wordt automatisch gezet zonder children. */
  iconOnly?: boolean;
  /** Icoon links van het label. */
  icon?: React.ReactNode;
  /** Icoon rechts van het label. */
  iconRight?: React.ReactNode;
  /** Toont een spinner en blokkeert interactie. */
  loading?: boolean;
  /** Rendert het child-element in plaats van een <button> (bv. een <a> of <Link>). */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    block,
    iconOnly,
    icon,
    iconRight,
    loading = false,
    asChild = false,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref
) {
  const Comp = (asChild ? Slot : "button") as React.ElementType;
  // Met asChild zitten icoon en label ín het meegegeven element (bv. <a>).
  const slot = slotChildren(asChild, children);
  const isIconOnly = iconOnly ?? (!slot.inner && (Boolean(icon) || Boolean(iconRight)));

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : disabled || loading}
      data-loading={loading ? "" : undefined}
      aria-busy={loading || undefined}
      className={button({ variant, size, block, iconOnly: isIconOnly, className })}
      {...rest}
    >
      {slot.wrap(
        <>
          {loading ? <Spinner size={size === "lg" ? 18 : size === "sm" ? 14 : 16} /> : icon}
          {slot.inner}
          {!loading && iconRight}
        </>
      )}
    </Comp>
  );
});

/** Groepeert knoppen tot één samengesteld blok. */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Knoppen tegen elkaar met gedeelde randen (standaard), of los met tussenruimte. */
  joined?: boolean;
  /** Vult de beschikbare breedte; elke knop wordt even breed. */
  block?: boolean;
  /** Toegankelijk label voor de groep, bijvoorbeeld "Weergave". */
  label?: string;
}

/** ButtonGroup — knoppen die bij elkaar horen, als één blok. Werkt ook met Toggle. */
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = "horizontal", joined = true, block, label, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cn(
        "lui-btn-group",
        `lui-btn-group-${orientation}`,
        joined && "lui-btn-group-joined",
        block && "lui-btn-group-block",
        className
      )}
      {...rest}
    />
  );
});

