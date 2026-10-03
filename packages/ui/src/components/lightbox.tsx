"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Portal } from "../lib/portal";
import { useControllableState, useEscapeKey, useFocusTrap, useLockScroll } from "../lib/hooks";

export interface LightboxItem {
  src: string;
  alt?: string;
  caption?: React.ReactNode;
  /** Kleinere versie voor het rijtje miniaturen. */
  thumb?: string;
}

export interface LightboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: LightboxItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Rijtje miniaturen onderaan. */
  thumbnails?: boolean;
  /** Zoomen met de knoppen, het scrollwiel of dubbelklikken. */
  zoomable?: boolean;
  maxZoom?: number;
  /** Van de laatste terug naar de eerste. */
  loop?: boolean;
  closeLabel?: string;
}

/**
 * Lightbox — afbeeldingen schermvullend bekijken, met pijltjes, miniaturen en
 * zoom. Escape sluit, pijltjes bladeren, de focus blijft binnen het venster.
 */
export const Lightbox = React.forwardRef<HTMLDivElement, LightboxProps>(function Lightbox(
  {
    items,
    open,
    onOpenChange,
    index,
    defaultIndex = 0,
    onIndexChange,
    thumbnails = true,
    zoomable = true,
    maxZoom = 4,
    loop = true,
    closeLabel = "Sluiten",
    className,
    ...rest
  },
  ref
) {
  const [huidig, setHuidig] = useControllableState<number>({
    value: index,
    defaultValue: defaultIndex,
    onChange: onIndexChange,
  });

  const [zoom, setZoom] = React.useState(1);
  const [verschuiving, setVerschuiving] = React.useState({ x: 0, y: 0 });
  const paneel = React.useRef<HTMLDivElement>(null);

  useEscapeKey(() => onOpenChange(false), open);
  useLockScroll(open);
  useFocusTrap(paneel, open);

  /* Elke wissel begint weer op ware grootte. */
  React.useEffect(() => {
    setZoom(1);
    setVerschuiving({ x: 0, y: 0 });
  }, [huidig, open]);

  const ga = React.useCallback(
    (richting: number) => {
      const volgende = huidig + richting;
      if (volgende < 0) setHuidig(loop ? items.length - 1 : 0);
      else if (volgende >= items.length) setHuidig(loop ? 0 : items.length - 1);
      else setHuidig(volgende);
    },
    [huidig, items.length, loop, setHuidig]
  );

  React.useEffect(() => {
    if (!open) return;
    const opToets = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") ga(1);
      if (event.key === "ArrowLeft") ga(-1);
      if (event.key === "0") setZoom(1);
    };
    window.addEventListener("keydown", opToets);
    return () => window.removeEventListener("keydown", opToets);
  }, [open, ga]);

  const sleep = React.useRef<{ x: number; y: number; start: { x: number; y: number } } | null>(null);

  if (!open || items.length === 0) return null;
  const item = items[Math.min(Math.max(huidig, 0), items.length - 1)];

  const zetZoom = (volgende: number) => {
    const geklemd = Math.min(Math.max(volgende, 1), maxZoom);
    setZoom(geklemd);
    if (geklemd === 1) setVerschuiving({ x: 0, y: 0 });
  };

  return (
    <Portal>
      <div
        ref={ref}
        className={cn("lui-lightbox", className)}
        role="dialog"
        aria-modal="true"
        aria-label={item.alt ?? "Afbeelding"}
        {...rest}
      >
        <div className="lui-lightbox-backdrop" onClick={() => onOpenChange(false)} />

        <div className="lui-lightbox-panel" ref={paneel} tabIndex={-1}>
          <div className="lui-lightbox-bar">
            <span className="lui-lightbox-counter">
              {huidig + 1} / {items.length}
            </span>
            <div className="lui-lightbox-tools">
              {zoomable && (
                <>
                  <button
                    type="button"
                    className="lui-lightbox-btn"
                    onClick={() => zetZoom(zoom - 0.5)}
                    disabled={zoom <= 1}
                    aria-label="Uitzoomen"
                  >
                    <Icon name="minus" size={17} />
                  </button>
                  <span className="lui-lightbox-zoom">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    className="lui-lightbox-btn"
                    onClick={() => zetZoom(zoom + 0.5)}
                    disabled={zoom >= maxZoom}
                    aria-label="Inzoomen"
                  >
                    <Icon name="plus" size={17} />
                  </button>
                </>
              )}
              <button
                type="button"
                className="lui-lightbox-btn"
                onClick={() => onOpenChange(false)}
                aria-label={closeLabel}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
          </div>

          <div
            className="lui-lightbox-stage"
            onWheel={
              zoomable
                ? (event) => {
                    if (!event.ctrlKey && !event.metaKey && zoom === 1) return;
                    event.preventDefault();
                    zetZoom(zoom - Math.sign(event.deltaY) * 0.3);
                  }
                : undefined
            }
            onDoubleClick={zoomable ? () => zetZoom(zoom > 1 ? 1 : 2) : undefined}
          >
            {items.length > 1 && (
              <button
                type="button"
                className="lui-lightbox-nav"
                data-side="prev"
                onClick={() => ga(-1)}
                disabled={!loop && huidig === 0}
                aria-label="Vorige"
              >
                <Icon name="chevronLeft" size={22} />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt ?? ""}
              className="lui-lightbox-image"
              draggable={false}
              style={{
                transform: `translate(${verschuiving.x}px, ${verschuiving.y}px) scale(${zoom})`,
                cursor: zoom > 1 ? "grab" : "default",
              }}
              onPointerDown={(event) => {
                if (zoom <= 1) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                sleep.current = { x: event.clientX, y: event.clientY, start: verschuiving };
              }}
              onPointerMove={(event) => {
                if (!sleep.current) return;
                setVerschuiving({
                  x: sleep.current.start.x + (event.clientX - sleep.current.x),
                  y: sleep.current.start.y + (event.clientY - sleep.current.y),
                });
              }}
              onPointerUp={() => (sleep.current = null)}
              onPointerCancel={() => (sleep.current = null)}
            />

            {items.length > 1 && (
              <button
                type="button"
                className="lui-lightbox-nav"
                data-side="next"
                onClick={() => ga(1)}
                disabled={!loop && huidig === items.length - 1}
                aria-label="Volgende"
              >
                <Icon name="chevronRight" size={22} />
              </button>
            )}
          </div>

          {item.caption && <p className="lui-lightbox-caption">{item.caption}</p>}

          {thumbnails && items.length > 1 && (
            <div className="lui-lightbox-thumbs" role="tablist" aria-label="Afbeeldingen">
              {items.map((thumb, i) => (
                <button
                  key={thumb.src}
                  type="button"
                  role="tab"
                  aria-selected={i === huidig}
                  className="lui-lightbox-thumb"
                  data-active={i === huidig ? "" : undefined}
                  onClick={() => setHuidig(i)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb.thumb ?? thumb.src} alt={thumb.alt ?? ""} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
});
