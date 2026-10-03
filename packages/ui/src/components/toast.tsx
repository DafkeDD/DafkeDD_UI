"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Portal } from "../lib/portal";
import { Icon, type IconName } from "../icons/icon";

export type ToastTone = "neutral" | "accent" | "green" | "amber" | "red" | "blue";

export interface ToastOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: ToastTone;
  /** Duur in ms; 0 blijft staan tot de gebruiker sluit. */
  duration?: number;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

export interface ToastItem extends ToastOptions {
  id: string;
  /** Staat op de uitgaande animatie te wachten voor hij uit de lijst gaat. */
  leaving?: boolean;
  /** Levensduur in ms (0 = blijft staan); stuurt het tijdsbalkje aan. */
  life?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  pause: () => void;
  resume: () => void;
}

interface Klok {
  timer: number;
  start: number;
  remaining: number;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum aantal zichtbare meldingen. */
  max?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "bottom-center" | "top-center";
  /** Standaardduur in ms. */
  duration?: number;
}

/** ToastProvider — zet dit één keer rond je app. */
export function ToastProvider({
  children,
  max = 4,
  position = "bottom-right",
  duration = 4200,
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timers = React.useRef(new Map<string, number>());
  // Resterende tijd per melding, zodat hover de klok kan pauzeren.
  const klokken = React.useRef(new Map<string, Klok>());
  const gepauzeerd = React.useRef(false);

  const dismiss = React.useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    const klok = klokken.current.get(id);
    if (klok) window.clearTimeout(klok.timer);
    klokken.current.delete(id);

    // Eerst markeren als vertrekkend; pas als de uitgaande animatie klaar is
    // verdwijnt de melding echt uit de lijst.
    setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    timers.current.set(
      id,
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        timers.current.delete(id);
      }, 190)
    );
  }, []);

  const push = React.useCallback(
    (options: ToastOptions) => {
      const id = `lui-toast-${Math.random().toString(36).slice(2, 10)}`;
      const life = options.duration ?? duration;
      setToasts((prev) => [...prev, { ...options, id, life }].slice(-max));
      if (life > 0) {
        const klok: Klok = { timer: 0, start: Date.now(), remaining: life };
        if (!gepauzeerd.current) klok.timer = window.setTimeout(() => dismiss(id), life);
        klokken.current.set(id, klok);
      }
      return id;
    },
    [max, duration, dismiss]
  );

  const pause = React.useCallback(() => {
    if (gepauzeerd.current) return;
    gepauzeerd.current = true;
    const nu = Date.now();
    klokken.current.forEach((klok) => {
      window.clearTimeout(klok.timer);
      klok.remaining = Math.max(0, klok.remaining - (nu - klok.start));
    });
  }, []);

  const resume = React.useCallback(() => {
    if (!gepauzeerd.current) return;
    gepauzeerd.current = false;
    const nu = Date.now();
    klokken.current.forEach((klok, id) => {
      klok.start = nu;
      klok.timer = window.setTimeout(() => dismiss(id), klok.remaining);
    });
  }, [dismiss]);

  React.useEffect(() => {
    const map = timers.current;
    const klok = klokken.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      klok.forEach((k) => window.clearTimeout(k.timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss, pause, resume }}>
      {children}
      <Toaster position={position} />
    </ToastContext.Provider>
  );
}

const TONE_ICON: Record<ToastTone, IconName> = {
  neutral: "info",
  accent: "sparkles",
  green: "checkCircle",
  amber: "alert",
  red: "alertCircle",
  blue: "info",
};

/** Toaster — rendert de stapel meldingen. Wordt door ToastProvider geplaatst. */
export function Toaster({ position = "bottom-right" }: { position?: ToastProviderProps["position"] }) {
  const context = React.useContext(ToastContext);
  if (!context || context.toasts.length === 0) return null;

  return (
    <Portal>
      <div
        className={cn("lui-toaster", `lui-toaster-${position}`)}
        role="region"
        aria-label="Meldingen"
        onMouseEnter={context.pause}
        onMouseLeave={context.resume}
        onFocus={context.pause}
        onBlur={context.resume}
      >
        {context.toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => context.dismiss(toast.id)} />
        ))}
      </div>
    </Portal>
  );
}

/** Eén melding: veegbaar naar opzij, met een tijdsbalkje onderaan. */
function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const tone = toast.tone ?? "neutral";
  const ref = React.useRef<HTMLDivElement>(null);
  const sleep = React.useRef<{ x: number; dx: number; id: number } | null>(null);

  const zet = (dx: number, animeer: boolean) => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = animeer ? "transform .22s var(--ease-out), opacity .22s var(--ease-out)" : "none";
    el.style.transform = dx ? `translateX(${dx}px) rotate(${dx / 40}deg)` : "";
    el.style.opacity = dx ? String(Math.max(0.2, 1 - Math.abs(dx) / 220)) : "";
  };

  return (
    <div
      ref={ref}
      data-state={toast.leaving ? "closed" : "open"}
      className={cn("lui-toast", `lui-toast-${tone}`)}
      role="status"
      style={toast.life ? ({ "--lui-toast-life": `${toast.life}ms` } as React.CSSProperties) : undefined}
      onPointerDown={(event) => {
        if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
        sleep.current = { x: event.clientX, dx: 0, id: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const s = sleep.current;
        if (!s || s.id !== event.pointerId) return;
        s.dx = event.clientX - s.x;
        zet(s.dx, false);
      }}
      onPointerUp={() => {
        const s = sleep.current;
        sleep.current = null;
        if (!s) return;
        if (Math.abs(s.dx) > 90) {
          if (ref.current) ref.current.dataset.swiped = "";
          zet(Math.sign(s.dx) * 360, true);
          onDismiss();
        } else {
          zet(0, true);
        }
      }}
      onPointerCancel={() => {
        sleep.current = null;
        zet(0, true);
      }}
    >
      <span className="lui-toast-icon">
        {toast.icon ?? <Icon name={TONE_ICON[tone]} size={15} />}
      </span>
      <div className="lui-toast-body">
        <div className="lui-toast-title">{toast.title}</div>
        {toast.description && <div className="lui-toast-description">{toast.description}</div>}
      </div>
      {toast.action && (
        <button
          type="button"
          className="lui-toast-action"
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button type="button" className="lui-toast-close" aria-label="Sluiten" onClick={onDismiss}>
        <Icon name="x" size={14} />
      </button>
      {toast.life ? <span className="lui-toast-timer" aria-hidden="true" /> : null}
    </div>
  );
}

export interface ToastApi {
  (options: ToastOptions): string;
  success: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "tone">) => string;
  error: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "tone">) => string;
  warning: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "tone">) => string;
  info: (title: React.ReactNode, options?: Omit<ToastOptions, "title" | "tone">) => string;
  dismiss: (id: string) => void;
}

/** useToast — meldingen tonen vanuit elk component onder de ToastProvider. */
export function useToast(): ToastApi {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast() vereist een <ToastProvider> hoger in de boom.");

  return React.useMemo(() => {
    const api = ((options: ToastOptions) => context.push(options)) as ToastApi;
    api.success = (title, options) => context.push({ ...options, title, tone: "green" });
    api.error = (title, options) => context.push({ ...options, title, tone: "red" });
    api.warning = (title, options) => context.push({ ...options, title, tone: "amber" });
    api.info = (title, options) => context.push({ ...options, title, tone: "blue" });
    api.dismiss = context.dismiss;
    return api;
  }, [context]);
}
