"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Badge } from "./badge";
import { RadioGroup, Radio } from "./radio-group";

/** Zoals `readers` uit `useEid()`. */
export interface EidReaderOption {
  name: string;
  cardPresent: boolean;
}

export interface EidReaderPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  readers: EidReaderOption[];
  /** Gekozen lezer (naam). */
  value?: string | null;
  onValueChange?: (name: string) => void;
  /** Lezers zonder kaart niet kiesbaar maken. */
  requireCard?: boolean;
  /** Tekst als er geen lezers zijn. */
  emptyText?: React.ReactNode;
  disabled?: boolean;
}

/**
 * EidReaderPicker — kies tussen meerdere kaartlezers; per lezer zie je of er een kaart in zit.
 * Geef `readers` en `reader` uit `useEid()` door.
 */
export const EidReaderPicker = React.forwardRef<HTMLDivElement, EidReaderPickerProps>(function EidReaderPicker(
  { readers, value, onValueChange, requireCard, emptyText = "Geen kaartlezer gevonden.", disabled, className, ...rest },
  ref
) {
  if (readers.length === 0) {
    return (
      <div ref={ref} className={cn("lui-eid-readers", "lui-eid-readers-empty", className)} {...rest}>
        <Icon name="scan" size={18} />
        <span>{emptyText}</span>
      </div>
    );
  }

  return (
    <RadioGroup
      ref={ref}
      aria-label="Kaartlezer"
      value={value === null ? "" : value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn("lui-eid-readers", className)}
      {...rest}
    >
      {readers.map((reader) => (
        <Radio
          key={reader.name}
          card
          value={reader.name}
          disabled={requireCard && !reader.cardPresent}
          label={<span className="lui-eid-readers-name">{reader.name}</span>}
          description={
            <Badge size="sm" tone={reader.cardPresent ? "green" : "neutral"} dot>
              {reader.cardPresent ? "Kaart aanwezig" : "Geen kaart"}
            </Badge>
          }
        />
      ))}
    </RadioGroup>
  );
});
