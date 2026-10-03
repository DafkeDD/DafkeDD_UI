"use client";
import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

type ZonderBotsingen<E> = Omit<
  React.HTMLAttributes<E>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onSelect" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface StackNotification {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "accent" | "green" | "amber" | "red" | "blue" | "violet";
  time?: React.ReactNode;
}

export interface NotificationStackProps extends ZonderBotsingen<HTMLDivElement> {
  items: StackNotification[];
  /** Hoeveel kaarten er achter de bovenste doorschemeren. */
  depth?: number;
  /** Een kaart is weggeschoven, weggeklikt of gewist. */
  onDismiss?: (item: StackNotification) => void;
  onSelect?: (item: StackNotification) => void;
  /** Bolletjes onder de stapel. */
  dots?: boolean;
  /** Telling rechtsboven, bv. "+3". */
  showCount?: boolean;
  /** Tekst onder de stapel, bv. "4 meldingen". `true` gebruikt de standaardtekst. */
  summary?: boolean | ((count: number) => React.ReactNode);
  /** Alle kaarten onder elkaar in plaats van op een stapel. */
  expanded?: boolean;
  /** Label van de knop die verschijnt als je een rij in de lijst opzij trekt. */
  clearLabel?: React.ReactNode;
  /** `glass` = doorschijnende kaarten voor op een donkere of kleurrijke achtergrond. */
  variant?: "default" | "glass";
  /** Waar een nieuwe melding vandaan komt. */
  enterFrom?: "left" | "top";
  emptyLabel?: React.ReactNode;
  /** Hoeveel pixels er geveegd moet worden om weg te leggen. */
  threshold?: number;
}

const OFFSET = 10;
const KRIMP = 0.045;
const VEER = { type: "spring", stiffness: 380, damping: 34 } as const;

/**
 * NotificationStack — meldingen op een stapel, met de nieuwste bovenop en de
 * rest eronder vandaan piepend. Veeg of klik de bovenste weg en de volgende
 * schuift naar voren. Uitgeklapt worden het rijen die je opzij trekt om te wissen.
 */
export const NotificationStack = React.forwardRef<HTMLDivElement, NotificationStackProps>(
  function NotificationStack(
    {
      items,
      depth = 3,
      onDismiss,
      onSelect,
      dots = true,
      showCount = true,
      summary = false,
      expanded,
      clearLabel = "Wissen",
      variant = "default",
      enterFrom = "left",
      emptyLabel = "Geen meldingen",
      threshold = 90,
      className,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const zichtbaar = expanded ? items : items.slice(0, depth);
    const rest_aantal = items.length - 1;
    // In de lijst staat hooguit één rij open, zoals in iOS.
    const [open, setOpen] = React.useState<string | null>(null);

    React.useEffect(() => {
      if (!expanded) setOpen(null);
    }, [expanded]);

    const samenvatting =
      summary === false
        ? null
        : typeof summary === "function"
          ? summary(items.length)
          : `${items.length} ${items.length === 1 ? "melding" : "meldingen"}`;

    if (items.length === 0) {
      return (
        <div ref={ref} className={cn("lui-notistack", className)} data-variant={variant} {...rest}>
          <p className="lui-notistack-empty">{emptyLabel}</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("lui-notistack", expanded && "lui-notistack-expanded", className)}
        data-variant={variant}
        {...rest}
      >
        {showCount && rest_aantal > 0 && !expanded && (
          <span className="lui-notistack-count">+{rest_aantal}</span>
        )}

        <div className="lui-notistack-deck">
          <AnimatePresence initial={false} mode="popLayout">
            {zichtbaar.map((item, index) => (
              <motion.div
                key={item.id}
                className="lui-notistack-item"
                data-behind={!expanded && index > 0 ? "" : undefined}
                style={{ zIndex: zichtbaar.length - index, pointerEvents: index === 0 || expanded ? "auto" : "none" }}
                layout={!rustig}
                initial={
                  rustig
                    ? false
                    : enterFrom === "left"
                      ? { opacity: 0, x: -70, scale: 0.94 }
                      : { opacity: 0, y: -14, scale: 0.96 }
                }
                animate={
                  expanded
                    ? { opacity: 1, x: 0, y: 0, scale: 1 }
                    : { opacity: index > 2 ? 0 : 1 - index * 0.12, x: 0, y: index * OFFSET, scale: 1 - index * KRIMP }
                }
                exit={rustig ? { opacity: 0 } : { opacity: 0, x: -120, transition: { duration: 0.22 } }}
                transition={VEER}
              >
                <Kaart
                  item={item}
                  top={index === 0}
                  expanded={Boolean(expanded)}
                  rustig={Boolean(rustig)}
                  threshold={threshold}
                  clearLabel={clearLabel}
                  open={open === item.id}
                  onOpenChange={(waarde) => setOpen(waarde ? item.id : null)}
                  onDismiss={onDismiss}
                  onSelect={onSelect}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!expanded && (samenvatting || (dots && items.length > 1)) && (
          <div className="lui-notistack-foot">
            {samenvatting && (
              <motion.span
                key={items.length}
                className="lui-notistack-summary"
                initial={rustig ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {samenvatting}
              </motion.span>
            )}
            {dots && items.length > 1 && (
              <span className="lui-notistack-dots" aria-hidden="true">
                {items.slice(0, 5).map((item, index) => (
                  <span key={item.id} className="lui-notistack-dot" data-active={index === 0 ? "" : undefined} />
                ))}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

const OPEN_BREEDTE = 76;

function Kaart({
  item,
  top,
  expanded,
  rustig,
  threshold,
  clearLabel,
  open,
  onOpenChange,
  onDismiss,
  onSelect,
}: {
  item: StackNotification;
  top: boolean;
  expanded: boolean;
  rustig: boolean;
  threshold: number;
  clearLabel: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: (item: StackNotification) => void;
  onSelect?: (item: StackNotification) => void;
}) {
  const x = useMotionValue(0);
  const knopDekking = useTransform(x, [-OPEN_BREEDTE, -16, 0], [1, 0, 0]);
  const knopSchaal = useTransform(x, [-OPEN_BREEDTE, 0], [1, 0.6]);
  const gesleept = React.useRef(false);

  // Openen of sluiten van buitenaf (andere rij geopend, lijst dichtgeklapt).
  React.useEffect(() => {
    if (!expanded && x.get() !== 0) animate(x, 0, VEER);
    else if (expanded) animate(x, open ? -OPEN_BREEDTE : 0, VEER);
  }, [open, expanded, x]);

  const kanWissen = expanded && Boolean(onDismiss);

  return (
    <div className="lui-notistack-row">
      {kanWissen && (
        <motion.button
          type="button"
          className="lui-notistack-clear"
          style={{ opacity: knopDekking, scale: knopSchaal }}
          tabIndex={open ? 0 : -1}
          onClick={() => onDismiss?.(item)}
          onFocus={() => onOpenChange(true)}
        >
          {clearLabel}
        </motion.button>
      )}
      <motion.article
        className="lui-notistack-card"
        data-tone={item.tone}
        data-top={top ? "" : undefined}
        tabIndex={kanWissen ? 0 : undefined}
        style={{ x }}
        drag={rustig ? false : expanded ? (kanWissen ? "x" : false) : top ? "x" : false}
        dragConstraints={
          expanded ? { left: -OPEN_BREEDTE - 20, right: 0 } : { left: -threshold * 2, right: threshold * 2 }
        }
        dragElastic={expanded ? 0.08 : 0.14}
        dragMomentum={false}
        onDragStart={() => {
          gesleept.current = true;
        }}
        onDragEnd={(_, info) => {
          window.setTimeout(() => (gesleept.current = false), 0);
          if (expanded) {
            const naarOpen = info.offset.x < -OPEN_BREEDTE / 2 || info.velocity.x < -300;
            onOpenChange(naarOpen);
            animate(x, naarOpen ? -OPEN_BREEDTE : 0, VEER);
            return;
          }
          if (Math.abs(info.offset.x) > threshold) onDismiss?.(item);
          else animate(x, 0, VEER);
        }}
        onKeyDown={(event) => {
          if (!kanWissen) return;
          if (event.key === "Delete" || event.key === "Backspace") onDismiss?.(item);
          if (event.key === "ArrowLeft") onOpenChange(true);
          if (event.key === "ArrowRight" || event.key === "Escape") onOpenChange(false);
        }}
        onClick={() => {
          if (gesleept.current) return;
          if (open) onOpenChange(false);
          else onSelect?.(item);
        }}
      >
        <span className="lui-notistack-icon">{item.icon ?? <Icon name="bell" size={15} />}</span>
        <span className="lui-notistack-body">
          <span className="lui-notistack-title">{item.title}</span>
          {item.description && <span className="lui-notistack-desc">{item.description}</span>}
        </span>
        {item.time && <span className="lui-notistack-time">{item.time}</span>}
        {onDismiss && !expanded && (
          <button
            type="button"
            className="lui-notistack-x"
            onClick={(event) => {
              event.stopPropagation();
              onDismiss(item);
            }}
            aria-label="Melding sluiten"
          >
            <Icon name="x" size={13} />
          </button>
        )}
      </motion.article>
    </div>
  );
}
