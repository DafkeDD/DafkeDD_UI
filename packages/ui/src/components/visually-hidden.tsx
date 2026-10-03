"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** Eigen element, standaard een span. */
  as?: React.ElementType;
}

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Id van het element waar de link naartoe springt, zonder hekje. */
  targetId?: string;
  children?: React.ReactNode;
}

/**
 * VisuallyHidden — tekst die je niet ziet maar een schermlezer wel voorleest.
 * Voor labels bij icoonknoppen, statusmeldingen en tabelkoppen.
 */
export const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden({ as: Comp = "span", className, ...rest }, ref) {
    return <Comp ref={ref} className={cn("lui-sr-only", className)} {...rest} />;
  }
);

/**
 * SkipLink — de eerste link op de pagina: onzichtbaar tot je tabt, en dan
 * springt hij over de navigatie heen naar de inhoud.
 */
export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink(
  { targetId = "inhoud", children = "Naar de inhoud", className, ...rest },
  ref
) {
  return (
    <a ref={ref} href={`#${targetId}`} className={cn("lui-skiplink", className)} {...rest}>
      {children}
    </a>
  );
});
