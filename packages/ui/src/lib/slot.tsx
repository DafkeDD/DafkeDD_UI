"use client";
/**
 * Slot — eigen implementatie van het `asChild`-patroon (zoals Radix Slot,
 * maar volledig zelf geschreven). Rendert het enige child-element en
 * voegt de props van de wrapper samen met die van het child.
 */
import * as React from "react";
import { cn } from "./cn";

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  ref
) {
  const child = onlyElement(children);
  if (!child) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "Dafke UI: een component met asChild verwacht precies één React-element als child " +
          "(bv. <a> of <Link>). Tekst, fragmenten of meerdere elementen kunnen niet."
      );
    }
    return null;
  }

  return React.cloneElement(child, {
    ...mergeProps(slotProps as Record<string, unknown>, child.props),
    ref: composeRefs(ref, (child as unknown as { ref?: React.Ref<HTMLElement> }).ref),
  } as Record<string, unknown>);
});

/**
 * Het enige element tussen de children, of null. Lege plekken (`null`,
 * `undefined`, `false`) tellen niet mee; tekst of een tweede element wel.
 */
function onlyElement(children: React.ReactNode): React.ReactElement<Record<string, unknown>> | null {
  const items = React.Children.toArray(children);
  if (items.length !== 1) return null;
  const [item] = items;
  return React.isValidElement(item) ? (item as React.ReactElement<Record<string, unknown>>) : null;
}

/**
 * Voor componenten die eigen inhoud rond het label zetten (icoon, badge,
 * spinner …) én asChild ondersteunen. Zonder asChild is `inner` gewoon de
 * children. Met asChild is `inner` de inhoud van het meegegeven element
 * (bv. de tekst in <a>), en `wrap()` zet de samengestelde inhoud terug in dat
 * element — zodat Slot precies één child krijgt.
 *
 *   const slot = slotChildren(asChild, children);
 *   <Comp …>{slot.wrap(<>{icon}{slot.inner}</>)}</Comp>
 */
export function slotChildren(asChild: boolean | undefined, children: React.ReactNode) {
  const doel = asChild ? onlyElement(children) : null;
  return {
    inner: (doel ? doel.props.children : children) as React.ReactNode,
    wrap: (content: React.ReactNode): React.ReactNode =>
      doel ? React.cloneElement(doel, undefined, content) : content,
  };
}

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...slotProps, ...childProps };

  for (const key in slotProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    if (/^on[A-Z]/.test(key) && typeof slotValue === "function" && typeof childValue === "function") {
      merged[key] = (...args: unknown[]) => {
        (childValue as (...a: unknown[]) => void)(...args);
        (slotValue as (...a: unknown[]) => void)(...args);
      };
    } else if (key === "style") {
      merged[key] = { ...(slotValue as object), ...(childValue as object) };
    } else if (key === "className") {
      merged[key] = cn(slotValue as string, childValue as string);
    }
  }

  return merged;
}

export function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") (ref as React.MutableRefObject<T>).current = node;
    }
  };
}
