"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

type ZonderBotsingen = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export interface DownloadButtonTexts {
  idle: React.ReactNode;
  busy: React.ReactNode;
  done: React.ReactNode;
  error: React.ReactNode;
}

export interface DownloadButtonProps extends ZonderBotsingen {
  /**
   * Het downloaden zelf. Roep `voortgang` met 0 tot 1 om de balk te vullen.
   * Geef `false` terug voor een fout.
   */
  onDownload?: (voortgang: (deel: number) => void) => boolean | void | Promise<boolean | void>;
  /** Voortgang van buitenaf sturen, 0 tot 1. */
  progress?: number;
  /** Balk in de knop, of een ring die de knop wordt. */
  variant?: "bar" | "ring";
  /** Percentage in de knop tonen. */
  showPercent?: boolean;
  /** Duur van de nepdownload wanneer er geen onDownload is, in ms. */
  demoDuration?: number;
  /** Terug naar het begin na zoveel ms; false blijft op "klaar" staan. */
  resetAfter?: number | false;
  texts?: Partial<DownloadButtonTexts>;
  size?: "sm" | "md" | "lg";
  tone?: "accent" | "violet" | "green";
  disabled?: boolean;
}

const STANDAARD: DownloadButtonTexts = {
  idle: "Download",
  busy: "Bezig…",
  done: "Gedownload",
  error: "Mislukt",
};

/**
 * DownloadButton — knop die tijdens het downloaden zelf de voortgang toont.
 * Met `variant="ring"` krimpt hij tot een ring die volloopt; met `"bar"` vult
 * de balk de knop van links naar rechts.
 */
export const DownloadButton = React.forwardRef<HTMLButtonElement, DownloadButtonProps>(
  function DownloadButton(
    {
      onDownload,
      progress,
      variant = "bar",
      showPercent = true,
      demoDuration = 2200,
      resetAfter = 2600,
      texts,
      size = "md",
      tone = "accent",
      disabled,
      className,
      children,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const woorden = { ...STANDAARD, ...texts };

    const [stand, setStand] = React.useState<"idle" | "busy" | "done" | "error">("idle");
    const [intern, setIntern] = React.useState(0);
    const deel = progress ?? intern;

    const timers = React.useRef<number[]>([]);
    React.useEffect(
      () => () => timers.current.forEach((t) => window.clearTimeout(t)),
      []
    );

    /* Een externe progress van 1 rondt de knop vanzelf af. */
    React.useEffect(() => {
      if (progress === undefined || stand !== "busy") return;
      if (progress >= 1) {
        setStand("done");
        if (resetAfter !== false) {
          timers.current.push(window.setTimeout(() => setStand("idle"), resetAfter));
        }
      }
    }, [progress, stand, resetAfter]);

    const start = async () => {
      if (disabled || stand === "busy") return;
      setStand("busy");
      setIntern(0);

      if (!onDownload) {
        /* Nepdownload voor demo's: even soepel oplopen tot 100%. */
        const stapjes = 24;
        for (let i = 1; i <= stapjes; i += 1) {
          timers.current.push(
            window.setTimeout(() => {
              setIntern(i / stapjes);
              if (i === stapjes) {
                setStand("done");
                if (resetAfter !== false) {
                  timers.current.push(window.setTimeout(() => setStand("idle"), resetAfter));
                }
              }
            }, (demoDuration / stapjes) * i)
          );
        }
        return;
      }

      try {
        const uitkomst = await onDownload((waarde) => setIntern(Math.min(Math.max(waarde, 0), 1)));
        if (uitkomst === false) {
          setStand("error");
        } else {
          setIntern(1);
          setStand("done");
        }
      } catch {
        setStand("error");
      }
      if (resetAfter !== false) {
        timers.current.push(window.setTimeout(() => setStand("idle"), resetAfter));
      }
    };

    const percent = Math.round(deel * 100);
    const label =
      stand === "busy" ? woorden.busy : stand === "done" ? woorden.done : stand === "error" ? woorden.error : children ?? woorden.idle;

    if (variant === "ring") {
      const straal = 22;
      const omtrek = 2 * Math.PI * straal;
      return (
        <div className={cn("lui-dlbtn-ringwrap", `lui-dlbtn-${size}`, className)} data-tone={tone}>
          <button
            ref={ref}
            type="button"
            className="lui-dlbtn-ring"
            data-state={stand}
            onClick={start}
            disabled={disabled}
            aria-label={typeof label === "string" ? label : "Downloaden"}
            {...rest}
          >
            <svg className="lui-dlbtn-ringsvg" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r={straal} className="lui-dlbtn-ringtrack" />
              <circle
                cx="28"
                cy="28"
                r={straal}
                className="lui-dlbtn-ringfill"
                strokeDasharray={omtrek}
                strokeDashoffset={omtrek * (1 - (stand === "idle" ? 0 : deel))}
              />
            </svg>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={stand}
                className="lui-dlbtn-ringicon"
                initial={rustig ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={rustig ? undefined : { scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  name={stand === "done" ? "check" : stand === "error" ? "x" : "download"}
                  size={18}
                />
              </motion.span>
            </AnimatePresence>
          </button>
          {showPercent && stand !== "idle" && (
            <span className="lui-dlbtn-ringpercent">{stand === "done" ? "100%" : `${percent}%`}</span>
          )}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn("lui-dlbtn", `lui-dlbtn-${size}`, className)}
        data-state={stand}
        data-tone={tone}
        onClick={start}
        disabled={disabled}
        {...rest}
      >
        <motion.span
          className="lui-dlbtn-fill"
          initial={false}
          animate={{ scaleX: stand === "busy" ? deel : stand === "idle" ? 0 : 1 }}
          transition={{ duration: rustig ? 0 : 0.25, ease: "linear" }}
        />
        <span className="lui-dlbtn-label">
          <Icon
            name={stand === "done" ? "check" : stand === "error" ? "alertCircle" : "download"}
            size={15}
          />
          {label}
          {showPercent && stand === "busy" && <span className="lui-dlbtn-percent">{percent}%</span>}
        </span>
      </button>
    );
  }
);
