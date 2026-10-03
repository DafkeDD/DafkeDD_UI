"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useCopyToClipboard } from "../lib/hooks";

export interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  /** Tekst die naar het klembord gaat. */
  value: string;
  /** Toont het label naast het icoon. */
  label?: React.ReactNode;
  /** Tekst na het kopiëren. */
  copiedLabel?: React.ReactNode;
  size?: "sm" | "md";
  variant?: "ghost" | "outline";
  onCopied?: (value: string) => void;
}

/** CopyButton — kopieert een waarde en bevestigt dat kort met een vinkje. */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, label, copiedLabel = "Gekopieerd", size = "md", variant = "ghost", className, onCopied, onClick, ...rest },
  ref
) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      ref={ref}
      type="button"
      data-copied={copied ? "" : undefined}
      aria-label={label ? undefined : copied ? String(copiedLabel) : "Kopiëren"}
      title={label ? undefined : "Kopiëren"}
      className={cn("lui-copy", `lui-copy-${size}`, `lui-copy-${variant}`, className)}
      onClick={async (event) => {
        onClick?.(event);
        const ok = await copy(value);
        if (ok) onCopied?.(value);
      }}
      {...rest}
    >
      <Icon name={copied ? "check" : "copy"} size={size === "sm" ? 13 : 15} />
      {label && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
});
