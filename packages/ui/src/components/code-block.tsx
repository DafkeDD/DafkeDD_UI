"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useCopyToClipboard } from "../lib/hooks";

const SLEUTELWOORDEN = new Set([
  "import", "from", "export", "default", "function", "return", "const", "let", "var", "if", "else",
  "type", "interface", "await", "async", "new", "class", "extends", "try", "catch", "throw", "for",
  "while", "switch", "case", "break", "continue", "true", "false", "null", "undefined",
]);

/**
 * Eén reguliere expressie, één doorgang: zo kan een token nooit binnen de HTML
 * van een eerder token belanden. Volgorde = voorrang.
 */
const TOKENS =
  /(\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*|(?<![^\s])#\s[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(<\/?)([A-Z][\w.]*)|\b([A-Za-z_]\w*)\b|\b(\d+(?:\.\d+)?)\b/g;

const escape = (waarde: string) =>
  waarde.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Kleine eigen highlighter: genoeg voor TSX-, CSS- en shellvoorbeelden, nul dependencies. */
export function highlightCode(code: string): string {
  let uit = "";
  let laatste = 0;
  for (const match of code.matchAll(TOKENS)) {
    const [geheel, commentaar, tekst, tagOpen, tagNaam, woord, getal] = match;
    uit += escape(code.slice(laatste, match.index));
    laatste = match.index! + geheel.length;

    if (commentaar) uit += `<span class="lui-code-com">${escape(commentaar)}</span>`;
    else if (tekst) uit += `<span class="lui-code-str">${escape(tekst)}</span>`;
    else if (tagNaam) uit += `${escape(tagOpen)}<span class="lui-code-tag">${tagNaam}</span>`;
    else if (woord) uit += SLEUTELWOORDEN.has(woord) ? `<span class="lui-code-key">${woord}</span>` : woord;
    else if (getal) uit += `<span class="lui-code-num">${getal}</span>`;
    else uit += escape(geheel);
  }
  return uit + escape(code.slice(laatste));
}

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  code: string;
  /** Label linksboven, bv. "tsx" of een bestandsnaam. */
  language?: React.ReactNode;
  /** Kopieerknop rechtsboven. */
  copyable?: boolean;
  /** Regelnummers in de kantlijn. */
  lineNumbers?: boolean;
  /** Regels die je wil oplichten, 1-gebaseerd. */
  highlightLines?: number[];
  /** Lange regels afbreken in plaats van horizontaal scrollen. */
  wrap?: boolean;
  /** Maximale hoogte in pixels; daarboven scrollt het blok. */
  maxHeight?: number;
  /** Kleuring uitzetten voor tekst die geen code is. */
  plain?: boolean;
}

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {}

/** Code — losse code binnen een zin. */
export const Code = React.forwardRef<HTMLElement, CodeProps>(function Code(
  { className, ...rest },
  ref
) {
  return <code ref={ref} className={cn("lui-code-inline", className)} {...rest} />;
});

/**
 * CodeBlock — codeweergave met taallabel, kopieerknop, regelnummers en
 * oplichtende regels. De kleuring is een eigen highlighter, dus geen dependency.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  {
    code,
    language,
    copyable = true,
    lineNumbers,
    highlightLines = [],
    wrap,
    maxHeight,
    plain,
    className,
    ...rest
  },
  ref
) {
  const { copied, copy } = useCopyToClipboard();
  const regels = React.useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);

  return (
    <div
      ref={ref}
      data-wrap={wrap ? "" : undefined}
      className={cn("lui-codeblock", className)}
      {...rest}
    >
      {(language || copyable) && (
        <div className="lui-codeblock-bar">
          {language && <span className="lui-codeblock-lang">{language}</span>}
          {copyable && (
            <button
              type="button"
              className="lui-codeblock-copy"
              aria-label={copied ? "Gekopieerd" : "Code kopiëren"}
              onClick={() => void copy(code)}
            >
              <Icon name={copied ? "check" : "copy"} size={15} />
            </button>
          )}
        </div>
      )}

      <pre className="lui-codeblock-pre" style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}>
        <code>
          {regels.map((regel, index) => (
            <span
              key={index}
              className="lui-codeblock-line"
              data-highlight={highlightLines.includes(index + 1) ? "" : undefined}
            >
              {lineNumbers && <span className="lui-codeblock-num">{index + 1}</span>}
              <span
                className="lui-codeblock-text"
                dangerouslySetInnerHTML={{
                  __html: plain
                    ? escape(regel) || "&nbsp;"
                    : highlightCode(regel) || "&nbsp;",
                }}
              />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
});
