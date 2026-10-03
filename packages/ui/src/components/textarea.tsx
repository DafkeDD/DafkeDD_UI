"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useFieldProps } from "./field";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  /** Groeit automatisch mee met de inhoud. */
  autoResize?: boolean;
  /** Hoogste aantal regels voordat het veld gaat scrollen; werkt met autoResize. */
  maxRows?: number;
  /** Teller rechtsonder; heeft maxLength nodig om een grens te tonen. */
  counter?: boolean;
  /** Knoppen linksonder in het veld, bv. emoji of een bijlage. */
  toolbar?: React.ReactNode;
  /** Dun balkje dat meeloopt met de teller. */
  progress?: boolean;
}

/**
 * Textarea — meerregelig tekstveld. Groeit desgewenst mee tot `maxRows`, en
 * toont een teller met balkje zodra je de grens nadert.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, autoResize, maxRows, counter, toolbar, progress, className, onInput, rows = 4, ...props },
  ref
) {
  const inner = React.useRef<HTMLTextAreaElement | null>(null);
  const merged = useFieldProps(props as Parameters<typeof useFieldProps>[0]) as TextareaProps;
  const { invalid: isInvalid, ...rest } = { ...merged, invalid: invalid ?? merged.invalid };

  const resize = React.useCallback(() => {
    const node = inner.current;
    if (!node || !autoResize) return;
    node.style.height = "auto";
    if (maxRows) {
      /* Eerst terug naar auto meten, dan aftoppen: anders krimpt het veld nooit. */
      const regel = parseFloat(getComputedStyle(node).lineHeight) || 20;
      const rand = node.offsetHeight - node.clientHeight;
      node.style.height = `${Math.min(node.scrollHeight, regel * maxRows + rand)}px`;
    } else {
      node.style.height = `${node.scrollHeight}px`;
    }
  }, [autoResize, maxRows]);

  React.useEffect(resize, [resize, rest.value]);

  const lengte = typeof rest.value === "string" ? rest.value.length : undefined;
  const grens = typeof rest.maxLength === "number" ? rest.maxLength : undefined;
  const heeftVoet = Boolean(toolbar || (counter && lengte !== undefined));
  const deel = lengte !== undefined && grens ? Math.min(lengte / grens, 1) : 0;
  const over = grens !== undefined && lengte !== undefined && lengte > grens;

  const veld = (
    <textarea
      ref={(node) => {
        inner.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }}
      rows={rows}
      className={cn("lui-textarea", isInvalid && "lui-input-invalid", className)}
      aria-invalid={isInvalid || undefined}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
    />
  );

  if (!heeftVoet) return veld;

  return (
    <div className={cn("lui-textarea-wrap", isInvalid && "lui-textarea-wrap-invalid")}>
      {veld}
      {progress && grens !== undefined && (
        <span className="lui-textarea-progress" aria-hidden="true">
          <span style={{ width: `${deel * 100}%` }} data-over={over ? "" : undefined} />
        </span>
      )}
      <div className="lui-textarea-foot">
        <div className="lui-textarea-tools">{toolbar}</div>
        {counter && lengte !== undefined && (
          <span className="lui-textarea-count" data-over={over ? "" : undefined}>
            {lengte}
            {grens !== undefined ? `/${grens}` : ""}
          </span>
        )}
      </div>
    </div>
  );
});
