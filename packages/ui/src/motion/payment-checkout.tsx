"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Field } from "../components/field";
import { Input } from "../components/input";
import { Button } from "../components/button";

export type PaymentStage = "form" | "processing" | "success" | "error";

export interface PaymentValues {
  /** Naam zoals op de kaart. */
  name: string;
  /** Kaartnummer, cijfers zonder spaties. */
  number: string;
  /** Vervaldatum als MMJJ. */
  expiry: string;
  cvc: string;
}

export interface PaymentCheckoutTexts {
  title: React.ReactNode;
  description: React.ReactNode;
  name: string;
  number: string;
  expiry: string;
  cvc: string;
  amount: React.ReactNode;
  pay: string;
  processing: React.ReactNode;
  successTitle: React.ReactNode;
  /** `{amount}` wordt vervangen door het bedrag. */
  successDescription: string;
  errorTitle: React.ReactNode;
  errorDescription: React.ReactNode;
  retry: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvc: string;
}

export interface PaymentCheckoutProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit" | "title" | "defaultValue"> {
  /** Bedrag in de kleinste eenheid van je munt, of gewoon in euro's. */
  amount: number;
  currency?: string;
  locale?: string;
  defaultValues?: Partial<PaymentValues>;
  onValuesChange?: (values: PaymentValues) => void;
  /** Voert de betaling uit. `false` of een fout toont de foutstatus. */
  onPay?: (values: PaymentValues) => boolean | void | Promise<boolean | void>;
  onPaid?: (values: PaymentValues) => void;
  /** Zonder onPay: hoelang het "verwerken" duurt, in ms. */
  demoDuration?: number;
  /** Demo: vult deze gegevens vanzelf in, teken per teken. */
  demoValues?: Partial<PaymentValues>;
  autoPlay?: boolean;
  texts?: Partial<PaymentCheckoutTexts>;
  disabled?: boolean;
}

const TEKSTEN: PaymentCheckoutTexts = {
  title: "Betaalgegevens",
  description: "Vul je kaartgegevens in om de betaling af te ronden.",
  name: "Naam op de kaart",
  number: "Kaartnummer",
  expiry: "Vervaldatum",
  cvc: "CVC",
  amount: "Te betalen",
  pay: "Nu betalen",
  processing: "Beveiligde transactie verwerken…",
  successTitle: "Betaling gelukt",
  successDescription: "Je betaling van {amount} is verwerkt.",
  errorTitle: "Betaling geweigerd",
  errorDescription: "Er ging iets mis. Controleer je gegevens en probeer opnieuw.",
  retry: "Opnieuw proberen",
  cardHolder: "Kaarthouder",
  cardExpiry: "Geldig tot",
  cardCvc: "CVC",
};

const LEEG: PaymentValues = { name: "", number: "", expiry: "", cvc: "" };
const VEER = { type: "spring", stiffness: 240, damping: 26 } as const;

function alleenCijfers(waarde: string, max: number) {
  return waarde.replace(/\D/g, "").slice(0, max);
}

/** Merk afleiden uit de eerste cijfers; genoeg voor het logo op de kaart. */
function merk(nummer: string): "visa" | "mastercard" | "amex" | "card" {
  if (/^4/.test(nummer)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(nummer)) return "mastercard";
  if (/^3[47]/.test(nummer)) return "amex";
  return "card";
}

function groepeer(nummer: string) {
  const amex = merk(nummer) === "amex";
  const groepen = amex ? [4, 6, 5] : [4, 4, 4, 4];
  const vakjes: string[] = [];
  let index = 0;
  for (const lengte of groepen) {
    vakjes.push(nummer.slice(index, index + lengte).padEnd(lengte, "•"));
    index += lengte;
  }
  return vakjes.join("  ");
}

function toonVervaldatum(waarde: string, leeg = "••/••") {
  if (!waarde) return leeg;
  return waarde.length > 2 ? `${waarde.slice(0, 2)}/${waarde.slice(2)}` : waarde;
}

/**
 * PaymentCheckout — kaartgegevens invullen met een kaart die meeschrijft en
 * omdraait voor de CVC. Bij het betalen schuift het formulier weg, blijft de
 * kaart over terwijl de transactie loopt, en eindigt alles in een bevestiging.
 */
export const PaymentCheckout = React.forwardRef<HTMLDivElement, PaymentCheckoutProps>(
  function PaymentCheckout(
    {
      amount,
      currency = "EUR",
      locale = "nl-BE",
      defaultValues,
      onValuesChange,
      onPay,
      onPaid,
      demoDuration = 2400,
      demoValues,
      autoPlay = false,
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

    const [waarden, setWaarden] = React.useState<PaymentValues>({ ...LEEG, ...defaultValues });
    const [stage, setStage] = React.useState<PaymentStage>("form");
    const [achterkant, setAchterkant] = React.useState(false);

    const beurt = React.useRef(0);
    const timers = React.useRef<number[]>([]);
    const recent = React.useRef({ onPay, onPaid, demoValues });
    recent.current = { onPay, onPaid, demoValues };

    const bedrag = React.useMemo(
      () => new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount),
      [amount, currency, locale]
    );

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

    const zet = (deel: Partial<PaymentValues>) => {
      setWaarden((vorige) => {
        const volgende = { ...vorige, ...deel };
        onValuesChange?.(volgende);
        return volgende;
      });
    };

    const betaal = React.useCallback(
      async (gegevens: PaymentValues) => {
        const id = (beurt.current += 1);
        setAchterkant(false);
        setStage("processing");

        let goed = true;
        try {
          const antwoord = recent.current.onPay
            ? await recent.current.onPay(gegevens)
            : await wacht(demoDuration);
          goed = antwoord !== false;
        } catch {
          goed = false;
        }
        if (beurt.current !== id) return;

        if (!goed) {
          setStage("error");
          return;
        }
        setStage("success");
        recent.current.onPaid?.(gegevens);
      },
      [demoDuration, wacht]
    );

    /** Demo: typt de gegevens teken per teken en betaalt daarna. */
    const speel = React.useCallback(async () => {
      const demo = recent.current.demoValues;
      if (!demo) return;
      stop();
      const id = (beurt.current += 1);
      setStage("form");
      setWaarden({ ...LEEG });

      const volgorde: Array<keyof PaymentValues> = ["name", "number", "expiry", "cvc"];
      const opgebouwd: PaymentValues = { ...LEEG };
      await wacht(600);
      for (const sleutel of volgorde) {
        const doel = demo[sleutel] ?? "";
        setAchterkant(sleutel === "cvc");
        for (let teken = 1; teken <= doel.length; teken += 1) {
          if (beurt.current !== id) return;
          opgebouwd[sleutel] = doel.slice(0, teken);
          setWaarden({ ...opgebouwd });
          await wacht(sleutel === "name" ? 55 : 90);
        }
        await wacht(320);
      }
      if (beurt.current !== id) return;
      setAchterkant(false);
      await wacht(400);
      if (beurt.current !== id) return;
      await betaal(opgebouwd);
    }, [betaal, stop, wacht]);

    React.useEffect(() => {
      if (autoPlay && demoValues) void speel();
      return () => {
        beurt.current += 1;
        stop();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPlay, speel, stop]);

    const compleet =
      waarden.number.length >= 13 && waarden.expiry.length === 4 && waarden.cvc.length >= 3;
    const bezig = stage === "processing";
    const gelukt = stage === "success";
    const mislukt = stage === "error";
    const ingeklapt = bezig || gelukt || mislukt;
    const label = merk(waarden.number);

    return (
      <div
        ref={ref}
        data-stage={stage}
        className={cn("lui-pay", className)}
        {...rest}
      >
        <motion.div className="lui-pay-grid" data-collapsed={ingeklapt ? "" : undefined} layout transition={veer}>
          {/* ---------- de kaart ---------- */}
          <motion.div className="lui-pay-cardwrap" layout transition={veer}>
            <motion.div
              className="lui-pay-card"
              data-brand={label}
              data-state={gelukt ? "ok" : mislukt ? "error" : bezig ? "busy" : undefined}
              animate={{
                rotateY: achterkant ? 180 : 0,
                scale: ingeklapt ? 1.04 : 1,
                y: bezig && !traag ? [0, -6, 0] : 0,
              }}
              transition={{
                rotateY: traag ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 22 },
                scale: veer,
                y: bezig && !traag ? { repeat: Infinity, duration: 2.4, ease: "easeInOut" } : { duration: 0.3 },
              }}
            >
              <div className="lui-pay-face lui-pay-front">
                <div className="lui-pay-row">
                  <span className="lui-pay-chip" aria-hidden="true" />
                  <span className="lui-pay-wave" aria-hidden="true" />
                  <span className="lui-pay-brandword">{label === "card" ? "CARD" : label}</span>
                </div>
                <div className="lui-pay-number">{groepeer(waarden.number)}</div>
                <div className="lui-pay-row lui-pay-row-foot">
                  <div>
                    <span className="lui-pay-cardlabel">{woorden.cardHolder}</span>
                    <span className="lui-pay-cardvalue">{waarden.name || "—"}</span>
                  </div>
                  <div>
                    <span className="lui-pay-cardlabel">{woorden.cardExpiry}</span>
                    <span className="lui-pay-cardvalue">{toonVervaldatum(waarden.expiry)}</span>
                  </div>
                </div>
              </div>

              <div className="lui-pay-face lui-pay-back">
                <span className="lui-pay-stripe" aria-hidden="true" />
                <div className="lui-pay-cvcrow">
                  <span className="lui-pay-cardlabel">{woorden.cardCvc}</span>
                  <span className="lui-pay-cvc">{waarden.cvc.replace(/./g, "•") || "•••"}</span>
                </div>
              </div>
            </motion.div>

            {/* gloed tijdens verwerken en na afloop */}
            <AnimatePresence>
              {ingeklapt && (
                <motion.span
                  key="glow"
                  className="lui-pay-glow"
                  data-tone={gelukt ? "ok" : mislukt ? "error" : "busy"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: traag ? 0 : 0.5 }}
                  aria-hidden="true"
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* ---------- het formulier ---------- */}
          <AnimatePresence initial={false}>
            {!ingeklapt && (
              <motion.form
                key="form"
                className="lui-pay-form"
                initial={{ opacity: 0, x: traag ? 0 : 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: traag ? 0 : 18, transition: { duration: traag ? 0 : 0.25 } }}
                transition={veer}
                onSubmit={(event) => {
                  event.preventDefault();
                  if (compleet) void betaal(waarden);
                }}
              >
                <div className="lui-pay-head">
                  <h3 className="lui-pay-title">{woorden.title}</h3>
                  <p className="lui-pay-text">{woorden.description}</p>
                </div>

                <Field label={woorden.name}>
                  <Input
                    value={waarden.name}
                    disabled={disabled}
                    autoComplete="cc-name"
                    placeholder="Voornaam Achternaam"
                    onFocus={() => setAchterkant(false)}
                    onChange={(event) => zet({ name: event.target.value })}
                  />
                </Field>

                <Field label={woorden.number}>
                  <Input
                    value={groepeer(waarden.number).replace(/•/g, "").trimEnd()}
                    disabled={disabled}
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    onFocus={() => setAchterkant(false)}
                    onChange={(event) => zet({ number: alleenCijfers(event.target.value, 16) })}
                  />
                </Field>

                <div className="lui-pay-duo">
                  <Field label={woorden.expiry}>
                    <Input
                      value={toonVervaldatum(waarden.expiry, "")}
                      disabled={disabled}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/JJ"
                      onFocus={() => setAchterkant(false)}
                      onChange={(event) => zet({ expiry: alleenCijfers(event.target.value, 4) })}
                    />
                  </Field>
                  <Field label={woorden.cvc}>
                    <Input
                      value={waarden.cvc}
                      disabled={disabled}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      onFocus={() => setAchterkant(true)}
                      onBlur={() => setAchterkant(false)}
                      onChange={(event) => zet({ cvc: alleenCijfers(event.target.value, 4) })}
                    />
                  </Field>
                </div>

                <div className="lui-pay-total">
                  <span>{woorden.amount}</span>
                  <strong>{bedrag}</strong>
                </div>

                <Button type="submit" block disabled={disabled || !compleet} iconRight={<Icon name="arrowRight" />}>
                  {woorden.pay} · {bedrag}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ---------- status onder de kaart ---------- */}
        <AnimatePresence mode="wait">
          {bezig && (
            <motion.div
              key="bezig"
              className="lui-pay-status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: traag ? 0 : 0.35 }}
            >
              <span className="lui-pay-spin" aria-hidden="true" />
              {woorden.processing}
            </motion.div>
          )}

          {gelukt && (
            <motion.div
              key="ok"
              className="lui-pay-status lui-pay-status-ok"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: traag ? 0 : 0.45, delay: traag ? 0 : 0.1 }}
            >
              <motion.span
                className="lui-pay-check"
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={traag ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 18 }}
                aria-hidden="true"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M5 12.5 L10 17.5 L19 7.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: traag ? 0 : 0.4, delay: traag ? 0 : 0.15, ease: "easeOut" }}
                  />
                </svg>
              </motion.span>
              <strong>{woorden.successTitle}</strong>
              <span>{woorden.successDescription.replace("{amount}", bedrag)}</span>
            </motion.div>
          )}

          {mislukt && (
            <motion.div
              key="fout"
              className="lui-pay-status lui-pay-status-error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: traag ? 0 : 0.35 }}
            >
              <strong>{woorden.errorTitle}</strong>
              <span>{woorden.errorDescription}</span>
              <Button variant="secondary" size="sm" onClick={() => setStage("form")}>
                {woorden.retry}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
