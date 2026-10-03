import type * as React from "react";

/**
 * Tags die in vertaalteksten gebruikt mogen worden, bijvoorbeeld:
 *   "Pas <code>tokens.css</code> aan en <strong>alles</strong> volgt."
 *
 * Zo blijft de opmaak in de vertaling zelf staan en hoeven zinnen niet in
 * stukjes geknipt te worden.
 */
export const richTags = {
  code: (chunks: React.ReactNode) => <code className="docs-inline-code">{chunks}</code>,
  strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
  br: () => <br />,
};
