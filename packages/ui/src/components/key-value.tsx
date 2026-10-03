"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface KeyValueListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Labels naast de waarden in plaats van eronder. */
  horizontal?: boolean;
  /** Breedte van de labelkolom bij horizontaal, bv. "38%" of "150px". */
  labelWidth?: string;
  /** Meerdere kolommen naast elkaar; schakelt terug naar één bij weinig ruimte. */
  columns?: number;
  /** Lijn tussen de rijen. */
  divided?: boolean;
  dense?: boolean;
}

export interface KeyValueProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Het label links (of boven). */
  label: React.ReactNode;
  /** De waarde; laat leeg voor het streepje. */
  children?: React.ReactNode;
  /** Wat er in plaats van een lege waarde komt. */
  empty?: React.ReactNode;
  /** Icoontje voor het label. */
  icon?: React.ReactNode;
  /** Laat de waarde op één regel afkappen. */
  truncate?: boolean;
}

/**
 * KeyValueList — labels met hun waarde, zoals in een dossierkop of een
 * detailpaneel. Horizontaal lijnen de labels netjes onder elkaar uit.
 */
export const KeyValueList = React.forwardRef<HTMLDListElement, KeyValueListProps>(
  function KeyValueList(
    { horizontal, labelWidth = "38%", columns, divided, dense, className, style, ...rest },
    ref
  ) {
    return (
      <dl
        ref={ref}
        data-horizontal={horizontal ? "" : undefined}
        data-divided={divided ? "" : undefined}
        data-dense={dense ? "" : undefined}
        className={cn("lui-kv", className)}
        style={
          {
            "--lui-kv-label": labelWidth,
            "--lui-kv-cols": columns && columns > 1 ? columns : undefined,
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      />
    );
  }
);

/** Eén regel in een KeyValueList. */
export const KeyValue = React.forwardRef<HTMLDivElement, KeyValueProps>(function KeyValue(
  { label, children, empty = "—", icon, truncate, className, ...rest },
  ref
) {
  const leeg = children === undefined || children === null || children === "";

  return (
    <div ref={ref} className={cn("lui-kv-row", className)} {...rest}>
      <dt className="lui-kv-key">
        {icon}
        {label}
      </dt>
      <dd className="lui-kv-value" data-truncate={truncate ? "" : undefined} data-empty={leeg ? "" : undefined}>
        {leeg ? empty : children}
      </dd>
    </div>
  );
});
