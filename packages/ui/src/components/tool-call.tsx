"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "../icons/icon";

export type ToolCallStatus = "pending" | "running" | "success" | "error";

export interface ToolCallProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Naam van het gereedschap, bv. "zoek_klant". */
  name: React.ReactNode;
  status?: ToolCallStatus;
  icon?: IconName;
  /** Korte samenvatting op de regel zelf, bv. "3 resultaten". */
  summary?: React.ReactNode;
  /** Wat erin ging; wordt als JSON getoond wanneer het geen string is. */
  input?: unknown;
  /** Wat eruit kwam. */
  output?: unknown;
  /** Foutmelding bij status "error". */
  error?: React.ReactNode;
  /** Duur in milliseconden. */
  duration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Compacte chip in plaats van een kaart. */
  compact?: boolean;
}

const ICOON: Record<ToolCallStatus, IconName> = {
  pending: "clock",
  running: "loader",
  success: "check",
  error: "alertCircle",
};

const alsTekst = (waarde: unknown) => {
  if (waarde === undefined || waarde === null) return "";
  if (typeof waarde === "string") return waarde;
  try {
    return JSON.stringify(waarde, null, 2);
  } catch {
    return String(waarde);
  }
};

/**
 * ToolCall — regel die laat zien welk gereedschap een model aanriep, met welke
 * invoer, en wat eruit kwam. Dichtgeklapt is het één regel; open zie je alles.
 */
export const ToolCall = React.forwardRef<HTMLDivElement, ToolCallProps>(function ToolCall(
  {
    name,
    status = "success",
    icon,
    summary,
    input,
    output,
    error,
    duration,
    open,
    defaultOpen,
    onOpenChange,
    compact,
    className,
    ...rest
  },
  ref
) {
  const [intern, setIntern] = React.useState(defaultOpen ?? false);
  const uitgeklapt = open ?? intern;
  const zetOpen = (waarde: boolean) => {
    if (open === undefined) setIntern(waarde);
    onOpenChange?.(waarde);
  };

  const invoer = alsTekst(input);
  const uitvoer = alsTekst(output);
  const heeftDetails = Boolean(invoer || uitvoer || error);

  return (
    <div
      ref={ref}
      className={cn("lui-toolcall", compact && "lui-toolcall-compact", className)}
      data-status={status}
      data-open={uitgeklapt ? "" : undefined}
      {...rest}
    >
      <button
        type="button"
        className="lui-toolcall-head"
        onClick={() => zetOpen(!uitgeklapt)}
        aria-expanded={heeftDetails ? uitgeklapt : undefined}
        disabled={!heeftDetails}
      >
        <span className="lui-toolcall-mark">
          <Icon name={icon ?? ICOON[status]} size={13} />
        </span>
        <span className="lui-toolcall-name">{name}</span>
        {summary && <span className="lui-toolcall-summary">{summary}</span>}
        {duration !== undefined && (
          <span className="lui-toolcall-duration">
            {duration < 1000 ? `${Math.round(duration)} ms` : `${(duration / 1000).toFixed(1)} s`}
          </span>
        )}
        {heeftDetails && <span className="lui-toolcall-chevron" aria-hidden="true" />}
      </button>

      {uitgeklapt && heeftDetails && (
        <div className="lui-toolcall-body">
          {invoer && (
            <div className="lui-toolcall-part">
              <span className="lui-toolcall-part-label">Invoer</span>
              <pre className="lui-toolcall-pre">{invoer}</pre>
            </div>
          )}
          {error ? (
            <div className="lui-toolcall-part">
              <span className="lui-toolcall-part-label">Fout</span>
              <p className="lui-toolcall-error">{error}</p>
            </div>
          ) : (
            uitvoer && (
              <div className="lui-toolcall-part">
                <span className="lui-toolcall-part-label">Resultaat</span>
                <pre className="lui-toolcall-pre">{uitvoer}</pre>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
});

export interface ApprovalCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onSelect"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Regeltjes met wat er precies gaat gebeuren. */
  details?: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  icon?: IconName;
  tone?: "accent" | "amber" | "red";
  onApprove?: (always: boolean) => void;
  onDeny?: () => void;
  approveLabel?: string;
  denyLabel?: string;
  /** Vinkje "altijd toestaan" bij de goedkeuring. */
  allowAlways?: boolean;
  alwaysLabel?: string;
  /** Uitkomst tonen in plaats van de knoppen. */
  decision?: "approved" | "denied" | null;
  disabled?: boolean;
}

/**
 * ApprovalCard — vraagt toestemming voor één handeling, met de details erbij
 * zodat je weet waar je ja op zegt.
 */
export const ApprovalCard = React.forwardRef<HTMLDivElement, ApprovalCardProps>(function ApprovalCard(
  {
    title,
    description,
    details,
    icon = "shield",
    tone = "amber",
    onApprove,
    onDeny,
    approveLabel = "Toestaan",
    denyLabel = "Weigeren",
    allowAlways,
    alwaysLabel = "Altijd toestaan",
    decision,
    disabled,
    className,
    ...rest
  },
  ref
) {
  const [altijd, setAltijd] = React.useState(false);

  return (
    <div ref={ref} className={cn("lui-approval", className)} data-tone={tone} role="group" {...rest}>
      <div className="lui-approval-head">
        <span className="lui-approval-icon">
          <Icon name={icon} size={16} />
        </span>
        <div className="lui-approval-text">
          <p className="lui-approval-title">{title}</p>
          {description && <p className="lui-approval-desc">{description}</p>}
        </div>
      </div>

      {details && details.length > 0 && (
        <dl className="lui-approval-details">
          {details.map((regel, index) => (
            <div className="lui-approval-row" key={index}>
              <dt>{regel.label}</dt>
              <dd>{regel.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {decision ? (
        <p className="lui-approval-decision" data-decision={decision}>
          <Icon name={decision === "approved" ? "checkCircle" : "xCircle"} size={15} />
          {decision === "approved" ? "Toegestaan" : "Geweigerd"}
        </p>
      ) : (
        <div className="lui-approval-actions">
          {allowAlways && (
            <label className="lui-approval-always">
              <input type="checkbox" checked={altijd} onChange={(e) => setAltijd(e.target.checked)} />
              {alwaysLabel}
            </label>
          )}
          <button
            type="button"
            className="lui-approval-btn"
            onClick={onDeny}
            disabled={disabled}
          >
            {denyLabel}
          </button>
          <button
            type="button"
            className="lui-approval-btn"
            data-primary=""
            onClick={() => onApprove?.(altijd)}
            disabled={disabled}
          >
            {approveLabel}
          </button>
        </div>
      )}
    </div>
  );
});
