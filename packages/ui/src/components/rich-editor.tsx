"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export type RichEditorTool =
  | "bold"
  | "italic"
  | "underline"
  | "highlight"
  | "bulletList"
  | "orderedList"
  | "clear";

export interface RichEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Begininhoud als HTML. */
  defaultValue?: string;
  /** Inhoud van buitenaf sturen; wordt alleen toegepast als ze afwijkt van wat er staat. */
  value?: string;
  /** Roept bij elke wijziging de nieuwe HTML terug. */
  onValueChange?: (html: string) => void;
  /** Welke knoppen in de werkbalk staan, in deze volgorde. */
  tools?: RichEditorTool[];
  /** Vervangt de hele werkbalk. */
  toolbar?: React.ReactNode;
  /** Regel onder het tekstvak, bijvoorbeeld "gemaakt door … op …". */
  footer?: React.ReactNode;
  placeholder?: string;
  minHeight?: number;
  disabled?: boolean;
  /** Alleen lezen: geen werkbalk, geen cursor. */
  readOnly?: boolean;
  /** Plakt als platte tekst, zodat opmaak van elders niet meelift (standaard aan). */
  plainPaste?: boolean;
  invalid?: boolean;
}

const DEFAULT_TOOLS: RichEditorTool[] = [
  "bold",
  "italic",
  "underline",
  "highlight",
  "bulletList",
  "orderedList",
  "clear",
];

/** Label, commando en toetsomschrijving per knop. */
const TOOLS: Record<RichEditorTool, { command: string; value?: string; label: string; glyph: React.ReactNode }> = {
  bold: { command: "bold", label: "Vet", glyph: <b>B</b> },
  italic: { command: "italic", label: "Cursief", glyph: <i>I</i> },
  underline: { command: "underline", label: "Onderstreept", glyph: <u>U</u> },
  highlight: {
    command: "hiliteColor",
    value: "var(--amber-tint)",
    label: "Markeren",
    glyph: <span className="lui-editor-mark">A</span>,
  },
  bulletList: { command: "insertUnorderedList", label: "Opsomming", glyph: <span aria-hidden>•—</span> },
  orderedList: { command: "insertOrderedList", label: "Genummerde lijst", glyph: <span aria-hidden>1.</span> },
  clear: { command: "removeFormat", label: "Opmaak wissen", glyph: <span aria-hidden>Tx</span> },
};

/**
 * RichEditor — tekstvak met opmaakknoppen, gebouwd op contentEditable.
 *
 * Let op: de inhoud is HTML. Komt ze van een gebruiker en toon je ze elders,
 * saneer ze dan server-side voor je ze weer rendert.
 */
export const RichEditor = React.forwardRef<HTMLDivElement, RichEditorProps>(function RichEditor(
  {
    defaultValue,
    value,
    onValueChange,
    tools = DEFAULT_TOOLS,
    toolbar,
    footer,
    placeholder,
    minHeight = 130,
    disabled,
    readOnly,
    plainPaste = true,
    invalid,
    className,
    ...rest
  },
  ref
) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<Record<string, boolean>>({});
  const [empty, setEmpty] = React.useState(!(value ?? defaultValue));

  // Inhoud alleen schrijven als ze echt afwijkt — anders springt de cursor weg.
  React.useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const next = value ?? defaultValue ?? "";
    if (value === undefined && body.innerHTML !== "") return;
    if (body.innerHTML !== next) body.innerHTML = next;
    setEmpty(body.textContent?.trim() === "");
  }, [value, defaultValue]);

  const refresh = React.useCallback(() => {
    const body = bodyRef.current;
    if (!body) return;
    setEmpty(body.textContent?.trim() === "");
    onValueChange?.(body.innerHTML);
  }, [onValueChange]);

  // Knoppen laten oplichten zolang de selectie in dit tekstvak staat.
  React.useEffect(() => {
    if (readOnly || disabled) return;
    const update = () => {
      const body = bodyRef.current;
      const selection = typeof window !== "undefined" ? window.getSelection() : null;
      if (!body || !selection?.anchorNode || !body.contains(selection.anchorNode)) return;
      const state: Record<string, boolean> = {};
      for (const tool of tools) {
        try {
          state[tool] = document.queryCommandState(TOOLS[tool].command);
        } catch {
          state[tool] = false;
        }
      }
      setActive(state);
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [tools, readOnly, disabled]);

  const run = (tool: RichEditorTool) => {
    const body = bodyRef.current;
    if (!body || disabled || readOnly) return;
    body.focus();
    const { command, value: commandValue } = TOOLS[tool];
    document.execCommand(command, false, commandValue);
    refresh();
  };

  const showToolbar = !readOnly && (toolbar ?? tools.length > 0);

  return (
    <div
      ref={ref}
      className={cn("lui-editor", invalid && "lui-editor-invalid", className)}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      {...rest}
    >
      {showToolbar &&
        (toolbar ?? (
          <div className="lui-editor-toolbar" role="toolbar" aria-label="Opmaak">
            {tools.map((tool) => (
              <button
                key={tool}
                type="button"
                className="lui-editor-tool"
                aria-label={TOOLS[tool].label}
                aria-pressed={active[tool] ? true : undefined}
                data-active={active[tool] ? "" : undefined}
                disabled={disabled}
                // Voorkomt dat het tekstvak de focus verliest bij het klikken.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => run(tool)}
              >
                {TOOLS[tool].glyph}
              </button>
            ))}
          </div>
        ))}

      <div
        ref={bodyRef}
        className="lui-editor-body"
        style={{ minHeight }}
        contentEditable={!disabled && !readOnly}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-readonly={readOnly ? true : undefined}
        aria-disabled={disabled ? true : undefined}
        data-placeholder={placeholder}
        data-empty={empty ? "" : undefined}
        onInput={refresh}
        onBlur={refresh}
        onPaste={
          plainPaste
            ? (event) => {
                event.preventDefault();
                const text = event.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
                refresh();
              }
            : undefined
        }
      />

      {footer && <div className="lui-editor-footer">{footer}</div>}
    </div>
  );
});
