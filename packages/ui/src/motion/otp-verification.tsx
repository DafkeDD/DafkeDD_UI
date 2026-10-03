"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

export type OtpStage = "typing" | "grid" | "merge" | "success" | "error";

/** "grid" schuift naar een 2x2 raster, "orbit" laat de vakjes rond het midden draaien. */
export type OtpVerificationVariant = "grid" | "orbit";

export interface OtpVerificationTexts {
  title: React.ReactNode;
  description: React.ReactNode;
  successTitle: React.ReactNode;
  successDescription: React.ReactNode;
  /** Melding onder de vakjes wanneer de code niet klopt. */
  error: React.ReactNode;
  resendPrompt: React.ReactNode;
  resendLabel: React.ReactNode;
  /** `{time}` wordt vervangen door de resterende tijd, bv. 00:39. */
  resendIn: string;
  secure: React.ReactNode;
  /** Knop: klaar om te controleren. */
  action: React.ReactNode;
  /** Knop: aan het controleren. */
  actionBusy: React.ReactNode;
  /** Knop: gelukt. */
  actionDone: React.ReactNode;
}

export interface OtpVerificationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "title" | "defaultValue"> {
  /** Aantal cijfers. */
  length?: number;
  /** Choreografie van de controle. */
  variant?: OtpVerificationVariant;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /**
   * Controleert de code zodra alle cijfers ingevuld zijn. Geef `false` terug of
   * gooi een fout voor de foutstatus; alles anders geldt als goed. Mag async zijn:
   * de animatie loopt ondertussen door.
   */
  onVerify?: (code: string) => boolean | void | Promise<boolean | void>;
  /** Wordt aangeroepen zodra de code aanvaard is. */
  onVerified?: (code: string) => void;
  /** Toont de "opnieuw sturen"-regel onderaan. */
  onResend?: () => void;
  /** Aantal seconden voor "opnieuw sturen" weer mag; 0 toont meteen de knop. */
  resendAfter?: number;
  /** Icoontje boven de titel; `null` laat het weg. */
  icon?: React.ReactNode | null;
  /** Knop onder de vakjes, met een eigen staat per fase. */
  action?: boolean;
  /** Eigen teksten; alles is optioneel. */
  texts?: Partial<OtpVerificationTexts>;
  /** Demo: typt deze code vanzelf in, zodat je de animatie ziet. */
  demoCode?: string;
  /** Start de demo bij het monteren. */
  autoPlay?: boolean;
  /** Herhaalt de demo na de succesanimatie. */
  loop?: boolean;
  /** Greepje bovenaan, zoals bij een bottom sheet. */
  handle?: boolean;
  /** Feest bij succes: snippers ("grid") of uitdijende ringen ("orbit"). */
  celebrate?: boolean;
  disabled?: boolean;
}

/* ------------------------------------------------------------------ *
 * Choreografie. Elk vakje staat absoluut in het midden en beweegt met
 * x/y, zodat rij -> raster of baan -> samensmelten één veer is in plaats
 * van drie layouts die elkaar tegenwerken.
 * ------------------------------------------------------------------ */
const BOX = { w: 56, h: 60 };
const STAP = 70; // afstand tussen de vakjes in de rij
const RASTER_X = 92; // breedte van het 2x2 raster (hart tot hart)
const RASTER_Y = 74; // hoogte van het 2x2 raster (hart tot hart)
const BAAN = 56; // straal van de draaiende baan

const DUUR = {
  start: 800,
  cijfer: 380,
  raster: 320,
  smelten: 1150,
  succes: 620,
  fout: 1400,
  herhalen: 2800,
};

const VEER: Transition = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };

const TEKSTEN: OtpVerificationTexts = {
  title: "Even je nummer bevestigen",
  description: "We stuurden je een code. Zodra ze volledig is, controleren we ze meteen.",
  successTitle: "Bevestigd",
  successDescription: "Je nummer is geverifieerd.",
  error: "Die code klopt niet.",
  resendPrompt: "Geen code ontvangen?",
  resendLabel: "Opnieuw sturen",
  resendIn: "Opnieuw sturen kan over {time}",
  secure: "Geverifieerd en beveiligd",
  action: "Bevestigen",
  actionBusy: "Aan het controleren…",
  actionDone: "Geverifieerd en beveiligd",
};

function rasterVorm(aantal: number) {
  const rijen = aantal >= 4 ? 2 : 1;
  return { rijen, kolommen: Math.ceil(aantal / rijen) };
}

/** Positie van vakje `index` in pixels, ten opzichte van het midden. */
function positie(index: number, aantal: number, stage: OtpStage, variant: OtpVerificationVariant) {
  if (stage === "typing" || stage === "error") {
    return { x: (index - (aantal - 1) / 2) * STAP, y: 0 };
  }
  if (stage === "grid") {
    if (variant === "orbit") {
      const hoek = (index / aantal) * Math.PI * 2 - Math.PI / 2;
      return { x: Math.cos(hoek) * BAAN, y: Math.sin(hoek) * BAAN };
    }
    const { rijen, kolommen } = rasterVorm(aantal);
    const kolom = Math.floor(index / rijen);
    const rij = index % rijen;
    return {
      x: (kolom - (kolommen - 1) / 2) * (RASTER_X / Math.max(kolommen - 1, 1)),
      y: (rij - (rijen - 1) / 2) * (RASTER_Y / Math.max(rijen - 1, 1)),
    };
  }
  return { x: 0, y: 0 }; // merge + success
}

function klok(seconden: number) {
  const m = Math.floor(seconden / 60);
  const s = seconden % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* Snippers met een vaste reeks "toevalscijfers": server en client renderen zo
   exact dezelfde markup en React klaagt niet over hydratie. */
const SNIPPERS = (() => {
  let zaad = 7;
  const rnd = () => {
    zaad = (zaad * 1664525 + 1013904223) % 4294967296;
    return zaad / 4294967296;
  };
  return Array.from({ length: 26 }, (_, index) => {
    const hoek = (index / 26) * Math.PI * 2 + rnd() * 0.5;
    const afstand = 70 + rnd() * 120;
    return {
      id: index,
      x: Math.cos(hoek) * afstand,
      y: Math.sin(hoek) * afstand * 0.75,
      size: 4 + rnd() * 7,
      vierkant: rnd() > 0.45,
      rotate: rnd() * 360,
      delay: rnd() * 0.18,
      duration: 0.9 + rnd() * 0.6,
    };
  });
})();

/**
 * OtpVerification — verificatiekaart die zichzelf controleert. In "grid"
 * schuiven de cijfers naar een raster en smelten ze samen; in "orbit" draaien
 * ze rond het midden tot het antwoord er is. Beide eindigen in een groene
 * bevestiging. Alle kleuren komen uit de tokens, dus licht én donker.
 */
export const OtpVerification = React.forwardRef<HTMLDivElement, OtpVerificationProps>(
  function OtpVerification(
    {
      length = 4,
      variant = "grid",
      value,
      defaultValue = "",
      onValueChange,
      onVerify,
      onVerified,
      onResend,
      resendAfter = 0,
      icon,
      action = false,
      texts,
      demoCode,
      autoPlay = false,
      loop = false,
      handle = false,
      celebrate = true,
      disabled,
      className,
      ...rest
    },
    ref
  ) {
    const woorden = { ...TEKSTEN, ...texts };
    const traag = useReducedMotion();
    const veer = traag ? { duration: 0 } : VEER;
    const baan = variant === "orbit";

    const [code, setCode] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    });
    const [stage, setStage] = React.useState<OtpStage>("typing");
    const [tikken, setTikken] = React.useState(resendAfter);

    const veld = React.useRef<HTMLInputElement | null>(null);
    const beurt = React.useRef(0);
    const timers = React.useRef<number[]>([]);
    const recent = React.useRef({ onVerify, onVerified, demoCode, loop });
    recent.current = { onVerify, onVerified, demoCode, loop };

    const stop = React.useCallback(() => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current = [];
    }, []);

    const wacht = React.useCallback(
      (ms: number) =>
        new Promise<void>((resolve) => {
          timers.current.push(window.setTimeout(resolve, ms));
        }),
      []
    );

    /** Tellertje voor "opnieuw sturen". */
    React.useEffect(() => {
      if (tikken <= 0) return;
      const timer = window.setInterval(() => setTikken((over) => Math.max(over - 1, 0)), 1000);
      return () => window.clearInterval(timer);
    }, [tikken]);

    /** raster of baan -> samensmelten -> succes, of terug naar typen bij een fout. */
    const controleer = React.useCallback(
      async (ingevoerd: string, id: number) => {
        const levend = () => beurt.current === id;

        await wacht(DUUR.raster);
        if (!levend()) return;
        setStage("grid");

        let goed = true;
        try {
          goed = (await recent.current.onVerify?.(ingevoerd)) !== false;
        } catch {
          goed = false;
        }
        if (!levend()) return;

        await wacht(DUUR.smelten);
        if (!levend()) return;

        if (!goed) {
          setStage("error");
          await wacht(DUUR.fout);
          if (!levend()) return;
          setCode("");
          setStage("typing");
          veld.current?.focus();
          return;
        }

        setStage("merge");
        await wacht(DUUR.succes);
        if (!levend()) return;
        setStage("success");
        recent.current.onVerified?.(ingevoerd);

        if (!recent.current.loop || !recent.current.demoCode) return;
        await wacht(DUUR.herhalen);
        if (!levend()) return;
        void speel();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [setCode, wacht]
    );

    /** Demo: typt de code cijfer per cijfer en controleert ze daarna. */
    const speel = React.useCallback(async () => {
      const demo = recent.current.demoCode;
      if (!demo) return;
      stop();
      const id = (beurt.current += 1);
      setStage("typing");
      setCode("");
      await wacht(DUUR.start);
      for (let index = 0; index < demo.length; index += 1) {
        if (beurt.current !== id) return;
        setCode(demo.slice(0, index + 1));
        await wacht(DUUR.cijfer);
      }
      if (beurt.current !== id) return;
      await controleer(demo, id);
    }, [controleer, setCode, stop, wacht]);

    React.useEffect(() => {
      if (autoPlay && demoCode) void speel();
      return () => {
        beurt.current += 1;
        stop();
      };
    }, [autoPlay, demoCode, speel, stop]);

    /** Zelf typen neemt het over van de demo. */
    const typ = (invoer: string) => {
      const schoon = invoer.replace(/\D/g, "").slice(0, length);
      stop();
      const id = (beurt.current += 1);
      setStage("typing");
      setCode(schoon);
      if (schoon.length === length) void controleer(schoon, id);
    };

    const opnieuw = () => {
      onResend?.();
      setTikken(resendAfter);
      if (demoCode) {
        void speel();
        return;
      }
      stop();
      beurt.current += 1;
      setCode("");
      setStage("typing");
      veld.current?.focus();
    };

    const cijfers = Array.from({ length }, (_, index) => code[index] ?? "");
    const actief = stage === "typing" ? code.length : -1;
    const klaar = stage === "success";
    const fout = stage === "error";
    const bezig = stage === "grid" || stage === "merge";
    const draait = baan && stage === "grid" && !traag;
    const vol = code.length === length;
    const { rijen, kolommen } = rasterVorm(length);

    return (
      <div
        ref={ref}
        role="group"
        aria-label={typeof woorden.title === "string" ? woorden.title : undefined}
        data-stage={stage}
        data-variant={variant}
        className={cn("lui-otpv", className)}
        {...rest}
      >
        <AnimatePresence>
          {klaar && (
            <motion.span
              key="glow"
              className="lui-otpv-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: traag ? 0 : 0.6 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {handle && <span className="lui-otpv-handle" aria-hidden="true" />}

        {icon !== null && icon !== undefined && (
          <motion.span
            className="lui-otpv-chip"
            data-ok={klaar ? "" : undefined}
            animate={klaar && !traag ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
            aria-hidden="true"
          >
            {klaar ? <Icon name="shield" size={16} /> : icon}
          </motion.span>
        )}

        {/* ---------- koppen, kruislings vervagend ---------- */}
        <div className="lui-otpv-head">
          <AnimatePresence initial={false} mode="popLayout">
            {klaar ? (
              <motion.div
                key="ok"
                className="lui-otpv-head-layer"
                initial={{ opacity: 0, filter: "blur(8px)", y: 6 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: traag ? 0 : 0.5, delay: traag ? 0 : 0.15 }}
              >
                <h2 className="lui-otpv-title lui-otpv-title-ok">{woorden.successTitle}</h2>
                <p className="lui-otpv-text">{woorden.successDescription}</p>
              </motion.div>
            ) : (
              <motion.div
                key="ask"
                className="lui-otpv-head-layer"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: traag ? 0 : 0.4 }}
              >
                <h2 className="lui-otpv-title">{woorden.title}</h2>
                <p className="lui-otpv-text">{woorden.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------- de vakjes ---------- */}
        <div className="lui-otpv-stage">
          <motion.div
            className="lui-otpv-anchor"
            animate={fout && !traag ? { x: [0, -9, 8, -6, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* kader dat het raster verbindt */}
            <AnimatePresence>
              {stage === "grid" && !baan && rijen > 1 && kolommen > 1 && (
                <motion.svg
                  key="links"
                  className="lui-otpv-links"
                  width={RASTER_X}
                  height={RASTER_Y}
                  viewBox={`0 0 ${RASTER_X} ${RASTER_Y}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  aria-hidden="true"
                >
                  {[
                    `M 0 0 H ${RASTER_X}`,
                    `M ${RASTER_X} 0 V ${RASTER_Y}`,
                    `M ${RASTER_X} ${RASTER_Y} H 0`,
                    `M 0 ${RASTER_Y} V 0`,
                  ].map((d, index) => (
                    <motion.path
                      key={d}
                      d={d}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: traag ? 0 : 0.45, delay: traag ? 0 : 0.1 + index * 0.07, ease: "easeOut" }}
                    />
                  ))}
                </motion.svg>
              )}
            </AnimatePresence>

            {/* de baan draait; in "grid" staat deze laag stil */}
            <motion.div
              className="lui-otpv-orbit"
              animate={draait ? { rotate: 360 } : { rotate: 0 }}
              transition={
                draait ? { repeat: Infinity, ease: "linear", duration: 2.6 } : { duration: 0.4 }
              }
            >
              {cijfers.map((cijfer, index) => {
                const { x, y } = positie(index, length, stage, variant);
                const typt = index === actief;
                const samen = stage === "merge" || klaar;
                return (
                  <motion.div
                    key={index}
                    className="lui-otpv-box"
                    data-active={typt ? "" : undefined}
                    data-state={fout ? "error" : bezig ? "checking" : undefined}
                    style={{ width: BOX.w, height: BOX.h, marginLeft: -BOX.w / 2, marginTop: -BOX.h / 2 }}
                    animate={{
                      x,
                      y,
                      // De baan draait; het vakje draait even hard terug, zodat het cijfer
                      // leesbaar blijft in plaats van op zijn kop te komen.
                      rotate: draait ? -360 : 0,
                      scale: samen ? 0.92 : baan && stage === "grid" ? 0.86 : 1,
                      opacity: klaar ? 0 : stage === "merge" ? 0.5 : 1,
                    }}
                    transition={{
                      ...veer,
                      opacity: { duration: traag ? 0 : 0.35 },
                      rotate: draait
                        ? { repeat: Infinity, ease: "linear", duration: 2.6 }
                        : { duration: 0.4 },
                    }}
                    aria-hidden="true"
                  >
                    <AnimatePresence mode="popLayout">
                      {cijfer && !samen && (
                        <motion.span
                          key={`${cijfer}-${index}`}
                          initial={{ opacity: 0, scale: 0.4, filter: "blur(4px)" }}
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                          transition={{ duration: traag ? 0 : 0.22 }}
                        >
                          {cijfer}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {typt && !cijfer && <span className="lui-otpv-caret" />}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* bevestigingsvakje */}
            <AnimatePresence>
              {klaar && (
                <motion.div
                  key="badge"
                  className="lui-otpv-badge"
                  style={{ width: BOX.w, height: BOX.h, marginLeft: -BOX.w / 2, marginTop: -BOX.h / 2 }}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={traag ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 18 }}
                  aria-hidden="true"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <motion.path
                      d="M5 12.5 L10 17.5 L19 7.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: traag ? 0 : 0.4, delay: traag ? 0 : 0.12, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* feest: ringen in "orbit", snippers in "grid" */}
            {klaar && celebrate && !traag && baan && (
              <span className="lui-otpv-rings" aria-hidden="true">
                {[0, 1].map((index) => (
                  <motion.i
                    key={index}
                    initial={{ scale: 0.35, opacity: 0.75 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    transition={{ duration: 1.4, delay: index * 0.35, ease: "easeOut" }}
                  />
                ))}
              </span>
            )}

            {klaar && celebrate && !traag && !baan && (
              <span className="lui-otpv-burst" aria-hidden="true">
                {SNIPPERS.map((snipper) => (
                  <motion.i
                    key={snipper.id}
                    style={{
                      width: snipper.size,
                      height: snipper.size,
                      borderRadius: snipper.vierkant ? 2 : 999,
                      marginLeft: -snipper.size / 2,
                      marginTop: -snipper.size / 2,
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.3, rotate: 0 }}
                    animate={{
                      x: snipper.x,
                      y: snipper.y,
                      opacity: [0, 1, 1, 0],
                      scale: [0.3, 1, 1, 0.7],
                      rotate: snipper.rotate,
                    }}
                    transition={{ duration: snipper.duration, delay: snipper.delay, ease: "easeOut" }}
                  />
                ))}
              </span>
            )}
          </motion.div>

          {/* onzichtbaar veld, zodat je er echt in kan typen */}
          <input
            ref={veld}
            className="lui-otpv-input"
            aria-label={typeof woorden.title === "string" ? woorden.title : "Verificatiecode"}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={length}
            value={code}
            disabled={disabled || stage !== "typing"}
            onChange={(event) => typ(event.target.value)}
          />
        </div>

        {/* ---------- voettekst ---------- */}
        <div className="lui-otpv-foot" aria-live="polite">
          <AnimatePresence mode="wait">
            {fout && (
              <motion.span
                key="fout"
                className="lui-otpv-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: traag ? 0 : 0.3 }}
              >
                {woorden.error}
              </motion.span>
            )}
            {stage === "typing" && onResend && (
              <motion.span
                key="opnieuw"
                className="lui-otpv-resend"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: traag ? 0 : 0.3 }}
              >
                {woorden.resendPrompt}{" "}
                {tikken > 0 ? (
                  <span className="lui-otpv-timer">
                    {woorden.resendIn.replace("{time}", klok(tikken))}
                  </span>
                ) : (
                  <button type="button" onClick={opnieuw} disabled={disabled}>
                    {woorden.resendLabel}
                  </button>
                )}
              </motion.span>
            )}
            {klaar && !action && (
              <motion.span
                key="veilig"
                className="lui-otpv-secure"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: traag ? 0 : 0.4, delay: traag ? 0 : 0.35 }}
              >
                <Icon name="lock" size={13} />
                {woorden.secure}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ---------- knop ---------- */}
        {action && (
          <button
            type="button"
            className="lui-otpv-cta"
            data-state={klaar ? "done" : bezig ? "busy" : undefined}
            disabled={disabled || bezig || klaar || !vol}
            onClick={() => {
              if (!vol) return;
              stop();
              void controleer(code, (beurt.current += 1));
            }}
          >
            {klaar ? (
              <>
                <Icon name="shield" size={15} />
                {woorden.actionDone}
              </>
            ) : bezig ? (
              <>
                <span className="lui-otpv-cta-spin" aria-hidden="true" />
                {woorden.actionBusy}
              </>
            ) : (
              <>
                {woorden.action}
                <Icon name="arrowRight" size={15} />
              </>
            )}
          </button>
        )}
      </div>
    );
  }
);
