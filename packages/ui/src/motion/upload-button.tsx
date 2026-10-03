"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export type UploadStage = "idle" | "uploading" | "done" | "error";

export interface UploadButtonTexts {
  /** Tekst in het veld zolang er geen bestand gekozen is. */
  placeholder: React.ReactNode;
  upload: React.ReactNode;
  uploading: React.ReactNode;
  done: React.ReactNode;
  error: React.ReactNode;
}

export interface UploadButtonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onProgress"> {
  /** Welke bestanden mogen; gaat rechtstreeks naar het invoerveld. */
  accept?: string;
  /**
   * Doet het echte werk. Roep `voortgang(0…1)` aan om de balk te vullen.
   * Geef `false` terug of gooi een fout voor de foutstatus.
   */
  onUpload?: (file: File, voortgang: (deel: number) => void) => boolean | void | Promise<boolean | void>;
  onUploaded?: (file: File) => void;
  onFileChange?: (file: File | null) => void;
  /** Zonder onUpload: hoelang de nep-upload duurt, in ms. */
  demoDuration?: number;
  /** Springt na zoveel ms terug naar het begin; `false` blijft op "klaar" staan. */
  resetAfter?: number | false;
  texts?: Partial<UploadButtonTexts>;
  disabled?: boolean;
}

const TEKSTEN: UploadButtonTexts = {
  placeholder: "Kies een bestand…",
  upload: "Uploaden",
  uploading: "Bezig met uploaden…",
  done: "Klaar",
  error: "Mislukt — opnieuw",
};

const VEER = { type: "spring", stiffness: 340, damping: 32, mass: 0.8 } as const;

/**
 * UploadButton — een bestandsveld met een knop ernaast die bij het uploaden
 * over het hele veld uitklapt, zich vult met de voortgang en daarna omslaat
 * naar "klaar". Eén pil, drie fasen.
 */
export const UploadButton = React.forwardRef<HTMLDivElement, UploadButtonProps>(function UploadButton(
  {
    accept,
    onUpload,
    onUploaded,
    onFileChange,
    demoDuration = 2600,
    resetAfter = 2600,
    texts,
    disabled,
    className,
    ...rest
  },
  ref
) {
  const woorden = { ...TEKSTEN, ...texts };
  const traag = useReducedMotion();
  const veer = traag ? { duration: 0 } : VEER;

  const [bestand, setBestand] = React.useState<File | null>(null);
  const [stage, setStage] = React.useState<UploadStage>("idle");
  const [deel, setDeel] = React.useState(0);

  const veld = React.useRef<HTMLInputElement | null>(null);
  const beurt = React.useRef(0);
  const timers = React.useRef<number[]>([]);

  React.useEffect(
    () => () => {
      beurt.current += 1;
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const wacht = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms));
    });

  const kies = (gekozen: File | null) => {
    setBestand(gekozen);
    setStage("idle");
    setDeel(0);
    onFileChange?.(gekozen);
  };

  const start = async () => {
    if (!bestand || stage === "uploading") return;
    const id = (beurt.current += 1);
    setStage("uploading");
    setDeel(0);

    let goed = true;
    try {
      if (onUpload) {
        goed = (await onUpload(bestand, (waarde) => {
          if (beurt.current === id) setDeel(Math.min(Math.max(waarde, 0), 1));
        })) !== false;
      } else {
        // Zonder onUpload tonen we een nette nep-voortgang.
        const stappen = 24;
        for (let stap = 1; stap <= stappen; stap += 1) {
          await wacht(demoDuration / stappen);
          if (beurt.current !== id) return;
          setDeel(stap / stappen);
        }
      }
    } catch {
      goed = false;
    }
    if (beurt.current !== id) return;

    if (!goed) {
      setStage("error");
      return;
    }

    setDeel(1);
    setStage("done");
    onUploaded?.(bestand);

    if (resetAfter === false) return;
    await wacht(resetAfter);
    if (beurt.current !== id) return;
    kies(null);
    if (veld.current) veld.current.value = "";
  };

  const bezig = stage === "uploading";
  const klaar = stage === "done";
  const fout = stage === "error";

  return (
    <div ref={ref} data-stage={stage} className={cn("lui-upb", className)} {...rest}>
      <input
        ref={veld}
        type="file"
        accept={accept}
        className="lui-upb-file"
        tabIndex={-1}
        disabled={disabled}
        onChange={(event) => kies(event.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        className="lui-upb-field"
        disabled={disabled || bezig}
        onClick={() => veld.current?.click()}
      >
        <Icon name="file" size={15} />
        <span className="lui-upb-name">{bestand ? bestand.name : woorden.placeholder}</span>
      </button>

      <motion.button
        type="button"
        layout
        className="lui-upb-action"
        data-state={stage}
        disabled={disabled || !bestand || bezig || klaar}
        onClick={start}
        transition={veer}
      >
        {/* de vullende balk kruipt mee met de voortgang */}
        <motion.span
          className="lui-upb-progress"
          animate={{ scaleX: bezig || klaar ? deel : 0 }}
          transition={{ duration: traag ? 0 : 0.25, ease: "easeOut" }}
          aria-hidden="true"
        />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={stage}
            className="lui-upb-label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: traag ? 0 : 0.22 }}
          >
            {klaar && <Icon name="check" size={15} />}
            {fout && <Icon name="alertCircle" size={15} />}
            {bezig ? woorden.uploading : klaar ? woorden.done : fout ? woorden.error : woorden.upload}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <span className="lui-sr-only" aria-live="polite">
        {bezig ? `${Math.round(deel * 100)}%` : klaar ? "Upload klaar" : fout ? "Upload mislukt" : ""}
      </span>
    </div>
  );
});
