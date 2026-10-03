"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Button, type ButtonSize, type ButtonVariant } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./dropdown-menu";

export interface SplitButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Label van de hoofdknop. */
  children?: React.ReactNode;
  /** De hoofdactie: één klik, zonder menu. */
  onAction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Alleen het menudeel blokkeren, bv. terwijl de hoofdactie loopt. */
  menuDisabled?: boolean;
  /** De menu-items; gebruik DropdownMenuItem, -Separator en -Label. */
  menu?: React.ReactNode;
  /** Voorkeurskant van het menu. */
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Toegankelijke naam voor het pijltje. */
  menuLabel?: string;
  /** Knop over de volle breedte. */
  block?: boolean;
  /** Rendert de hoofdknop als iets anders, bv. een <a>. */
  asChild?: boolean;
}

/**
 * SplitButton — één knop met twee delen: links de hoofdactie die je meteen
 * uitvoert, rechts een pijltje met de minder gebruikte varianten. Scheelt een
 * menu openen voor wat je toch altijd kiest.
 */
export const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
  {
    children,
    onAction,
    icon,
    variant = "primary",
    size = "md",
    disabled,
    loading,
    menuDisabled,
    menu,
    side = "bottom",
    align = "end",
    open,
    defaultOpen,
    onOpenChange,
    menuLabel = "Meer acties",
    block,
    asChild,
    className,
    ...rest
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("lui-splitbtn", block && "lui-splitbtn-block", className)}
      data-variant={variant}
      {...rest}
    >
      <Button
        variant={variant}
        size={size}
        icon={icon}
        disabled={disabled}
        loading={loading}
        asChild={asChild}
        onClick={onAction}
        className="lui-splitbtn-main"
      >
        {children}
      </Button>

      <DropdownMenu open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            iconOnly
            disabled={disabled || menuDisabled}
            aria-label={menuLabel}
            className="lui-splitbtn-toggle"
          >
            <Icon name="chevronDown" size={15} className="lui-splitbtn-chevron" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side} align={align}>
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});
