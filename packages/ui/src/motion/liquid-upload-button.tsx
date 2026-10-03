"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface LiquidUploadButtonTexts {
  idle: React.ReactNode;
  busy: React.ReactNode;
  done: React.ReactNode;
  error: React.ReactNode;
  starting: React.ReactNode;
}

export interface LiquidUploadButtonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onProgress"> {
  /** Welke bestanden mogen. */
  accept?: string;
  /**
   * Het uploaden. Roep `voortgang` aan met 0 tot 1; geef `false` terug voor een fout.
   * Zonder deze functie speelt de knop een demo af.
   */
  onUpload?: (file: File, voortgang: (deel: number) => void) => boolean | void | Promise<boolean | void>;
  onUploaded?: (file: File) => void;
  /** "split": label links, bakje rechts. "icon": alleen het bakje. */
  layout?: "split" | "icon";
  tone?: "accent" | "dark" | "light";
  /** Onderschrift met de voortgang in megabytes. */
  showBytes?: boolean;
  /** Grootte van het nepbestand in de demo, in bytes. */
  demoSize?: number;
  demoDuration?: number;
  resetAfter?: number | false;
  texts?: Partial<LiquidUploadButtonTexts>;
  disabled?: boolean;
}

const STANDAARD: LiquidUploadButtonTexts = {
  idle: "Uploaden",
  busy: "Bezig",
  done: "Geüpload",
  error: "Mislukt",
  starting: "Starten…",
};

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

/**
 * LiquidUploadButton — uploadknop waarvan het bakje vol vloeistof loopt.
 * Eerst valt er een druppel in, dan stijgt het niveau met de voortgang mee,
 * en onder de knop staat hoeveel er al binnen is.
 */
export const LiquidUploadButton = React.forwardRef<HTMLDivElement, LiquidUploadButtonProps>(
  function LiquidUploadButton(
    {
      accept,
      onUpload,
      onUploaded,
      layout = "split",
      tone = "accent",
      showBytes = true,
      demoSize = 2.4 * 1024 * 1024,
      demoDuration = 2600,
      resetAfter = false,
      texts,
      disabled,
      className,
      ...rest
    },
    ref
  ) {
    const rustig = useReducedMotion();
    const woorden = { ...STANDAARD, ...texts };
    const invoer = React.useRef<HTMLInputElement>(null);
    const [stand, setStand] = React.useState<"idle" | "busy" | "done" | "error">("idle");
    const [deel, setDeel] = React.useState(0);
    const [grootte, setGrootte] = React.useState(demoSize);
    const timers = React.useRef<number[]>([]);
    React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

    const klaar = (goed: boolean, file?: File) => {
      setStand(goed ? "done" : "error");
      if (goed) setDeel(1);
      if (goed && file) onUploaded?.(file);
      if (resetAfter !== false) {
        timers.current.push(
          window.setTimeout(() => {
            setStand("idle");
            setDeel(0);
          }, resetAfter)
        );
      }
    };

    const start = async (file?: File) => {
      if (disabled || stand === "busy") return;
      setStand("busy");
      setDeel(0);

      if (!file || !onUpload) {
        /* Demo: eerst de druppel laten vallen, dan soepel vollopen. */
        setGrootte(file?.size ?? demoSize);
        const stappen = 30;
        for (let i = 1; i <= stappen; i += 1) {
          timers.current.push(
            window.setTimeout(() => {
              setDeel(i / stappen);
              if (i === stappen) klaar(true, file);
            }, 450 + (demoDuration / stappen) * i)
          );
        }
        return;
      }

      setGrootte(file.size);
      try {
        const uitkomst = await onUpload(file, (waarde) => setDeel(Math.min(Math.max(waarde, 0), 1)));
        klaar(uitkomst !== false, file);
      } catch {
        klaar(false);
      }
    };

    const onderschrift =
      stand === "busy"
        ? deel === 0
          ? woorden.starting
          : `${mb(grootte * deel)} / ${mb(grootte)}`
        : stand === "done"
          ? `${mb(grootte)} gelezen`
          : null;

    const labelTekst = woorden[stand];

    return (
      <div
        ref={ref}
        className={cn("lui-liquid", `lui-liquid-${layout}`, className)}
        data-tone={tone}
        data-state={stand}
        /* Staat de vloeistof boven het midden, dan wisselt het pijltje van kleur. */
        data-high={deel > 0.45 ? "" : undefined}
        {...rest}
      >
        <input
          ref={invoer}
          type="file"
          className="lui-sr-only"
          accept={accept}
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void start(file);
          }}
        />
        <button
          type="button"
          className="lui-liquid-btn"
          disabled={disabled || stand === "busy"}
          onClick={() => (onUpload ? invoer.current?.click() : void start())}
          aria-label={layout === "icon" && typeof labelTekst === "string" ? labelTekst : undefined}
        >
          {layout === "split" && (
            <span className="lui-liquid-labelwrap">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={stand}
                  className="lui-liquid-label"
                  initial={rustig ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={rustig ? undefined : { y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {labelTekst}
                </motion.span>
              </AnimatePresence>
            </span>
          )}

          <span className="lui-liquid-tank" aria-hidden="true">
            {/* de druppel die er eerst in valt */}
            {stand === "busy" && deel === 0 && !rustig && <span className="lui-liquid-drop" />}
            {/* het vloeistofniveau met een golvend oppervlak */}
            <span className="lui-liquid-fill" style={{ transform: `translateY(${(1 - deel) * 100}%)` }}>
              <span className="lui-liquid-wave" />
            </span>
            <span className="lui-liquid-icon">
              <Icon name={stand === "done" ? "check" : stand === "error" ? "x" : "arrowUp"} size={17} strokeWidth={2.4} />
            </span>
          </span>
        </button>

        {showBytes && (
          <span className="lui-liquid-caption" aria-live="polite">
            {onderschrift}
          </span>
        )}
      </div>
    );
  }
);
