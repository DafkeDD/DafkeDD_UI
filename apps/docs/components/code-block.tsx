"use client";
import * as React from "react";
import { Button, Icon, useCopyToClipboard } from "@dafke/ui";

const KEYWORDS = new Set([
  "import", "from", "export", "default", "function", "return", "const", "let", "var", "if", "else",
  "type", "interface", "await", "async", "new", "useState", "useMemo", "useEffect",
]);

/**
 * Één reguliere expressie, één doorgang: zo kan een token nooit binnen de HTML van een
 * eerder token terechtkomen. Volgorde = voorrang: commentaar, strings, JSX-tag, woord, getal.
 */
const TOKENS =
  /(\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*|(?<![^\s])#\s[^\n]*)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(<\/?)([A-Z][\w.]*)|\b([A-Za-z_]\w*)\b|\b(\d+(?:\.\d+)?)\b/g;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Kleine eigen highlighter — genoeg voor TSX-, CSS- en shellvoorbeelden, nul dependencies. */
function highlight(code: string): string {
  let out = "";
  let last = 0;
  for (const match of code.matchAll(TOKENS)) {
    const [whole, comment, string, tagOpen, tagName, word, number] = match;
    out += escapeHtml(code.slice(last, match.index));
    last = match.index! + whole.length;

    if (comment) out += `<span class="tok-com">${escapeHtml(comment)}</span>`;
    else if (string) out += `<span class="tok-str">${escapeHtml(string)}</span>`;
    else if (tagName) out += `${escapeHtml(tagOpen)}<span class="tok-tag">${tagName}</span>`;
    else if (word) out += KEYWORDS.has(word) ? `<span class="tok-key">${word}</span>` : word;
    else if (number) out += `<span class="tok-num">${number}</span>`;
    else out += escapeHtml(whole);
  }
  return out + escapeHtml(code.slice(last));
}

export interface CodeBlockProps {
  code: string;
  /** Toont een kopieerknop rechtsboven. */
  copyable?: boolean;
  standalone?: boolean;
}

export function CodeBlock({ code, copyable = true, standalone }: CodeBlockProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <div style={{ position: "relative" }}>
      {copyable && (
        <Button
          size="sm"
          variant="ghost"
          aria-label="Code kopiëren"
          icon={<Icon name={copied ? "check" : "copy"} />}
          onClick={() => copy(code)}
          style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        />
      )}
      <pre className={standalone ? "docs-code docs-code-standalone" : "docs-code"}>
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </div>
  );
}
