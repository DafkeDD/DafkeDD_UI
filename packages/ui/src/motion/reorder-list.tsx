"use client";
import * as React from "react";
import { Reorder, useDragControls, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

/** De DOM-drag- en animatiehandlers botsen met die van motion; die laten we weg. */
type ZonderBotsingen<E> = Omit<
  React.HTMLAttributes<E>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface ReorderListProps<T> extends Omit<ZonderBotsingen<HTMLUListElement>, "onReorder" | "values"> {
  /** De huidige volgorde. Elke waarde moet uniek zijn. */
  values: T[];
  onReorder: (values: T[]) => void;
  axis?: "x" | "y";
  children?: React.ReactNode;
}

/**
 * ReorderList — lijst waarvan je de volgorde sleept.
 *
 * <ReorderList values={taken} onReorder={setTaken}>
 *   {taken.map((taak) => <ReorderListItem key={taak.id} value={taak}>…</ReorderListItem>)}
 * </ReorderList>
 */
export function ReorderList<T>({ values, onReorder, axis = "y", className, children, ...rest }: ReorderListProps<T>) {
  return (
    <Reorder.Group
      as="ul"
      axis={axis}
      values={values}
      onReorder={onReorder}
      className={cn("lui-reorder", axis === "x" && "lui-reorder-x", className)}
      {...rest}
    >
      {children}
    </Reorder.Group>
  );
}

export interface ReorderListItemProps<T> extends Omit<ZonderBotsingen<HTMLLIElement>, "value"> {
  value: T;
  /** Alleen aan de greep slepen in plaats van aan de hele rij. */
  handle?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function ReorderListItem<T>({
  value,
  handle,
  disabled,
  className,
  children,
  ...rest
}: ReorderListItemProps<T>) {
  const controls = useDragControls();
  const reduced = useReducedMotion();

  return (
    <Reorder.Item
      as="li"
      value={value}
      drag={disabled ? false : undefined}
      dragListener={!handle && !disabled}
      dragControls={controls}
      className={cn("lui-reorder-item", className)}
      whileDrag={{ scale: reduced ? 1 : 1.02, zIndex: 2 }}
      transition={{ type: "spring", stiffness: 500, damping: 45 }}
      {...rest}
    >
      {handle && !disabled && (
        <span
          className="lui-reorder-handle"
          role="button"
          tabIndex={-1}
          aria-label="Verslepen"
          onPointerDown={(event) => controls.start(event)}
        >
          <Icon name="grip" size={15} />
        </span>
      )}
      <span className="lui-reorder-content">{children}</span>
    </Reorder.Item>
  );
}
