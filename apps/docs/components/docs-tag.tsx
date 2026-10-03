/**
 * Klein label bij een component of demo: "nieuw" (groen) of "bijgewerkt" (amber).
 * Puur presentatie — het vertaalde woord komt van de aanroeper, zodat dit
 * component zowel in server- als client-componenten bruikbaar blijft.
 */
export function DocsTag({ kind, label }: { kind: "new" | "updated"; label: string }) {
  return <span className={`docs-tag docs-tag-${kind}`}>{label}</span>;
}
