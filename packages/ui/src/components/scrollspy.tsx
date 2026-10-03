"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface ScrollspyItem {
  /** Id van de sectie in de pagina, zonder hekje. */
  id: string;
  label: React.ReactNode;
  /** Diepte: 1 is een hoofdstuk, 2 een paragraaf. */
  level?: number;
}

export interface ScrollspyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onChange" | "title"> {
  items: ScrollspyItem[];
  /** Kop boven de lijst. */
  title?: React.ReactNode;
  /** Ruimte boven de sectie voor een plakkende balk, in pixels. */
  offset?: number;
  /** Zacht scrollen bij een klik. */
  smooth?: boolean;
  onChange?: (id: string) => void;
  /** De container waarin gescrold wordt; standaard het venster. */
  root?: React.RefObject<HTMLElement | null>;
}

/**
 * Scrollspy — inhoudsopgave die vanzelf het hoofdstuk markeert dat in beeld is.
 * Klikken scrollt ernaartoe en zet de hash, zonder dat de pagina verspringt.
 */
export const Scrollspy = React.forwardRef<HTMLElement, ScrollspyProps>(function Scrollspy(
  { items, title, offset = 96, smooth = true, onChange, root, className, ...rest },
  ref
) {
  const [actief, setActief] = React.useState<string | undefined>(items[0]?.id);
  const gemeld = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    const secties = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (secties.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const zichtbaar = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!zichtbaar) return;
        const id = zichtbaar.target.id;
        setActief(id);
        if (gemeld.current !== id) {
          gemeld.current = id;
          onChange?.(id);
        }
      },
      {
        root: root?.current ?? null,
        // De sectie telt zodra ze net onder de plakkende balk staat.
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    secties.forEach((sectie) => observer.observe(sectie));
    return () => observer.disconnect();
  }, [items, offset, onChange, root]);

  const spring = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const doel = document.getElementById(id);
    if (!doel) return;
    event.preventDefault();
    const houder = root?.current;
    const top = houder
      ? doel.offsetTop - offset
      : doel.getBoundingClientRect().top + window.scrollY - offset;
    (houder ?? window).scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    window.history.replaceState(null, "", `#${id}`);
    setActief(id);
  };

  return (
    <nav ref={ref} className={cn("lui-scrollspy", className)} aria-label="Op deze pagina" {...rest}>
      {title && <div className="lui-scrollspy-title">{title}</div>}
      <ul>
        {items.map((item) => (
          <li key={item.id} data-level={item.level ?? 1}>
            <a
              href={`#${item.id}`}
              data-active={actief === item.id ? "" : undefined}
              aria-current={actief === item.id ? "location" : undefined}
              onClick={(event) => spring(event, item.id)}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
