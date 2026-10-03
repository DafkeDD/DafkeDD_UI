"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "../icons/icon";
import { useCopyToClipboard, useOutsideClick, useEscapeKey } from "../lib/hooks";

export interface ShareChannel {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Sjabloon met `{url}`; wordt in een nieuw venster geopend. */
  href?: string;
  /** Eigen afhandeling in plaats van href; `false` slaat het kopiëren over. */
  onSelect?: (url: string) => boolean | void;
  /** Kleur van het icoon, bv. var(--green). */
  tone?: string;
}

export interface ShareButtonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  /** Wat gedeeld wordt. */
  url: string;
  children?: React.ReactNode;
  channels?: ShareChannel[];
  texts?: { pick?: React.ReactNode; copying?: React.ReactNode; copied?: React.ReactNode; close?: string };
  onShare?: (channel: ShareChannel) => void;
  disabled?: boolean;
}

const STANDAARD_KANALEN: ShareChannel[] = [
  { id: "mail", label: "E-mail", href: "mailto:?body={url}", tone: "var(--red)" },
  { id: "link", label: "Link kopiëren", tone: "var(--accent)" },
];

const ICOON: Record<string, IconName> = { mail: "mail", link: "link", copy: "copy", send: "send" };

/**
 * ShareButton — de knop waaiert open naar de kanalen, je kiest er een, en de
 * link belandt op het klembord met een bevestiging.
 */
export const ShareButton = React.forwardRef<HTMLDivElement, ShareButtonProps>(function ShareButton(
  {
    url,
    children = "Delen",
    channels = STANDAARD_KANALEN,
    texts,
    onShare,
    disabled,
    className,
    ...rest
  },
  ref
) {
  const traag = useReducedMotion();
  const woorden = {
    pick: texts?.pick ?? "Kies een kanaal",
    copying: texts?.copying ?? "Kopiëren…",
    copied: texts?.copied ?? "Link gekopieerd",
    close: texts?.close ?? "Sluiten",
  };

  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "copying" | "copied">("idle");
  const host = React.useRef<HTMLDivElement | null>(null);
  const { copy } = useCopyToClipboard();
  const timers = React.useRef<number[]>([]);

  React.useEffect(
    () => () => timers.current.forEach((timer) => window.clearTimeout(timer)),
    []
  );

  useOutsideClick([host], () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  const kies = async (kanaal: ShareChannel) => {
    onShare?.(kanaal);
    if (kanaal.href) {
      window.open(kanaal.href.replace("{url}", encodeURIComponent(url)), "_blank", "noopener");
      setOpen(false);
      return;
    }
    if (kanaal.onSelect?.(url) === false) {
      setOpen(false);
      return;
    }
    setStatus("copying");
    await copy(url);
    setStatus("copied");
    timers.current.push(
      window.setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1500)
    );
  };

  const straal = 74;
  const hoek = (index: number) => {
    const spreiding = Math.PI * 1.15;
    const start = -Math.PI / 2 - spreiding / 2;
    const stap = channels.length > 1 ? spreiding / (channels.length - 1) : 0;
    return start + index * stap;
  };

  return (
    <div
      ref={(node) => {
        host.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
      }}
      data-open={open ? "" : undefined}
      className={cn("lui-shareb", className)}
      {...rest}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {!open ? (
          <motion.button
            key="trigger"
            type="button"
            className="lui-shareb-trigger"
            disabled={disabled}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: traag ? 0 : 0.2 }}
          >
            <Icon name="share" size={15} />
            {children}
          </motion.button>
        ) : (
          <motion.div
            key="fan"
            className="lui-shareb-fan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: traag ? 0 : 0.2 }}
          >
            {channels.map((kanaal, index) => (
              <motion.button
                key={kanaal.id}
                type="button"
                className="lui-shareb-channel"
                style={{ color: kanaal.tone }}
                aria-label={kanaal.label}
                title={kanaal.label}
                onClick={() => void kies(kanaal)}
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                animate={{
                  x: traag ? 0 : Math.cos(hoek(index)) * straal,
                  y: traag ? 0 : Math.sin(hoek(index)) * straal,
                  scale: 1,
                  opacity: 1,
                }}
                exit={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                transition={
                  traag
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 26, delay: index * 0.05 }
                }
              >
                {kanaal.icon ?? <Icon name={ICOON[kanaal.id] ?? "link"} size={17} />}
              </motion.button>
            ))}

            <button
              type="button"
              className="lui-shareb-close"
              aria-label={woorden.close}
              onClick={() => setOpen(false)}
            >
              {status === "copied" ? <Icon name="check" size={17} /> : <Icon name="x" size={17} />}
            </button>

            <span className="lui-shareb-hint" aria-live="polite">
              {status === "copying" ? woorden.copying : status === "copied" ? woorden.copied : woorden.pick}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
