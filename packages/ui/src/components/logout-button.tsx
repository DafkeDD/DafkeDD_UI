"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface LogoutButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** Uitgevoerd zodra het mannetje door de deur is. */
  onLogout?: () => void | Promise<void>;
  /** Hoe lang de wandeling duurt, in ms. */
  duration?: number;
  /** Terug naar het begin na zoveel ms; false blijft op "weg" staan. */
  resetAfter?: number | false;
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
}

/**
 * LogoutButton — knop met een mannetje dat bij het klikken door een deur
 * wegwandelt, waarna de deur dichtgaat. Bij hover zet het al een stapje.
 */
export const LogoutButton = React.forwardRef<HTMLButtonElement, LogoutButtonProps>(function LogoutButton(
  {
    onLogout,
    duration = 1100,
    resetAfter = 2200,
    variant = "dark",
    size = "md",
    disabled,
    className,
    children = "Uitloggen",
    ...rest
  },
  ref
) {
  const [stand, setStand] = React.useState<"idle" | "leaving" | "gone">("idle");
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const klik = () => {
    if (disabled || stand !== "idle") return;
    setStand("leaving");
    timers.current.push(
      window.setTimeout(async () => {
        setStand("gone");
        await onLogout?.();
        if (resetAfter !== false) {
          timers.current.push(window.setTimeout(() => setStand("idle"), resetAfter));
        }
      }, duration)
    );
  };

  return (
    <button
      ref={ref}
      type="button"
      className={cn("lui-logout", `lui-logout-${variant}`, `lui-logout-${size}`, className)}
      data-state={stand}
      style={{ ["--lui-logout-dur" as string]: `${duration}ms` }}
      disabled={disabled}
      onClick={klik}
      aria-live="polite"
      {...rest}
    >
      <span className="lui-logout-label">{children}</span>
      <span className="lui-logout-scene" aria-hidden="true">
        <svg viewBox="0 0 36 26" width="36" height="26">
          {/* deur: kozijn en deurblad dat dichtdraait */}
          <rect className="lui-logout-frame" x="23" y="2" width="11" height="22" rx="1.5" />
          <rect className="lui-logout-leaf" x="23" y="2" width="11" height="22" rx="1.5" />
          {/* het mannetje */}
          <g className="lui-logout-man">
            <circle cx="9" cy="6" r="2.6" />
            <line x1="9" y1="9" x2="9" y2="16" />
            <line className="lui-logout-arm lui-logout-arm-a" x1="9" y1="10.5" x2="12.5" y2="14" />
            <line className="lui-logout-arm lui-logout-arm-b" x1="9" y1="10.5" x2="5.5" y2="14" />
            <line className="lui-logout-leg lui-logout-leg-a" x1="9" y1="16" x2="12" y2="22.5" />
            <line className="lui-logout-leg lui-logout-leg-b" x1="9" y1="16" x2="6" y2="22.5" />
          </g>
        </svg>
      </span>
    </button>
  );
});
