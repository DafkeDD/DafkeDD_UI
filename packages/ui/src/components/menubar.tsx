"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { composeRefs } from "../lib/slot";
import { useEscapeKey, useOutsideClick } from "../lib/hooks";
import { MenuProvider, DropdownMenuContent, type DropdownMenuContentProps } from "./dropdown-menu";

interface MenubarContextValue {
  open: string | null;
  setOpen: (waarde: string | null) => void;
  /** Eenmaal open volgt het menu de muis, zoals in een echte menubalk. */
  volgen: boolean;
  setVolgen: (volgen: boolean) => void;
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null);

function useMenubar(component: string): MenubarContextValue {
  const context = React.useContext(MenubarContext);
  if (!context) throw new Error(`<${component}> moet binnen <Menubar> staan.`);
  return context;
}

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

/**
 * Menubar — vaste menubalk zoals in een desktop-app: Bestand, Bewerken, Beeld.
 * Gebruikt dezelfde items als DropdownMenu.
 */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(function Menubar(
  { label = "Hoofdmenu", className, children, ...rest },
  ref
) {
  const [open, setOpen] = React.useState<string | null>(null);
  const [volgen, setVolgen] = React.useState(false);
  const eigen = React.useRef<HTMLDivElement | null>(null);

  useOutsideClick([eigen], () => {
    setOpen(null);
    setVolgen(false);
  }, open !== null);

  useEscapeKey(() => {
    setOpen(null);
    setVolgen(false);
  }, open !== null);

  return (
    <MenubarContext.Provider value={{ open, setOpen, volgen, setVolgen }}>
      <div
        ref={composeRefs(ref, eigen)}
        role="menubar"
        aria-label={label}
        className={cn("lui-menubar", className)}
        {...rest}
      >
        {children}
      </div>
    </MenubarContext.Provider>
  );
});

export interface MenubarMenuProps {
  /** Unieke naam van dit menu; ook wat er op de knop staat als er geen label is. */
  value: string;
  children?: React.ReactNode;
}

interface MenuItemContextValue {
  value: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const MenubarMenuContext = React.createContext<MenuItemContextValue | null>(null);

export function MenubarMenu({ value, children }: MenubarMenuProps) {
  const anchorRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <MenubarMenuContext.Provider value={{ value, anchorRef, contentRef }}>{children}</MenubarMenuContext.Provider>
  );
}

export interface MenubarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(function MenubarTrigger(
  { className, children, onClick, onMouseEnter, ...rest },
  ref
) {
  const { open, setOpen, volgen, setVolgen } = useMenubar("MenubarTrigger");
  const menu = React.useContext(MenubarMenuContext);
  if (!menu) throw new Error("<MenubarTrigger> moet binnen <MenubarMenu> staan.");

  const isOpen = open === menu.value;

  return (
    <button
      ref={composeRefs(ref as React.Ref<HTMLElement>, menu.anchorRef) as React.Ref<HTMLButtonElement>}
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={isOpen}
      data-state={isOpen ? "open" : "closed"}
      className={cn("lui-menubar-trigger", className)}
      onClick={(event) => {
        onClick?.(event);
        setOpen(isOpen ? null : menu.value);
        setVolgen(!isOpen);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (volgen) setOpen(menu.value);
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export type MenubarContentProps = Omit<DropdownMenuContentProps, "matchWidth">;

export const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(function MenubarContent(
  { side = "bottom", align = "start", offset = 4, ...rest },
  ref
) {
  const { open, setOpen } = useMenubar("MenubarContent");
  const menu = React.useContext(MenubarMenuContext);
  if (!menu) throw new Error("<MenubarContent> moet binnen <MenubarMenu> staan.");

  const isOpen = open === menu.value;

  // DropdownMenuContent positioneert zelf, met de menubalk-trigger uit de context als anker.
  return (
    <MenuProvider
      value={{
        open: isOpen,
        setOpen: (waarde: boolean) => setOpen(waarde ? menu.value : null),
        anchorRef: menu.anchorRef,
        contentRef: menu.contentRef,
      }}
    >
      <DropdownMenuContent ref={ref} side={side} align={align} offset={offset} {...rest} />
    </MenuProvider>
  );
});
