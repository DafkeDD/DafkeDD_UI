"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "../icons/icon";

export type AlertTone = "neutral" | "accent" | "green" | "amber" | "red" | "blue";

const TONE_ICON: Record<AlertTone, IconName> = {
  neutral: "info",
  accent: "sparkles",
  green: "checkCircle",
  amber: "alert",
  red: "alertCircle",
  blue: "info",
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: AlertTone;
  title?: React.ReactNode;
  /** Eigen icoon; `null` verbergt het icoon. */
  icon?: React.ReactNode | null;
  /** Toont een sluitknop. */
  onDismiss?: () => void;
  /** Knoppen of links onderaan. */
  action?: React.ReactNode;
}

/** Alert — inline melding met toon, titel en optionele actie. */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "neutral", title, icon, onDismiss, action, className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} role="alert" className={cn("lui-alert", `lui-alert-${tone}`, className)} {...rest}>
      {icon !== null && (
        <span className="lui-alert-icon">{icon ?? <Icon name={TONE_ICON[tone]} size={17} />}</span>
      )}
      <div className="lui-alert-body">
        {title && <div className="lui-alert-title">{title}</div>}
        {children && <div className="lui-alert-text">{children}</div>}
        {action && <div className="lui-alert-action">{action}</div>}
      </div>
      {onDismiss && (
        <button type="button" className="lui-alert-close" aria-label="Sluiten" onClick={onDismiss}>
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );
});
