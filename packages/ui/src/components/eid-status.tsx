"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon, type IconName } from "../icons/icon";
import { Button } from "./button";
import { Spinner } from "./spinner";

/** Dezelfde fases als `useEid()` uit @dafkedd/eid. */
export type EidPhase =
  | "connecting"
  | "no-bridge"
  | "bridge-outdated"
  | "no-reader"
  | "no-card"
  | "ready"
  | "reading"
  | "done"
  | "error";

export interface EidStatusText {
  title: React.ReactNode;
  text?: React.ReactNode;
}

export interface EidStatusDownloads {
  /** Link naar het installatiebestand voor Windows. */
  windows?: string;
  /** Link naar het installatiebestand voor macOS. */
  mac?: string;
}

export interface EidStatusProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  phase: EidPhase;
  /** Naam van de kaartlezer die gebruikt wordt. */
  reader?: string | null;
  /** Fout uit `useEid()`; de melding komt onder de titel. */
  error?: { code?: string; message: string } | null;
  /** Downloadlinks voor de eID-bridge; getoond als die ontbreekt of verouderd is. */
  downloads?: EidStatusDownloads;
  /** Toont een knop "Kaart lezen" bij `ready` en "Opnieuw" bij `error`. */
  onRead?: () => void;
  /** Eigen teksten per fase. */
  labels?: Partial<Record<EidPhase, EidStatusText>>;
  /** Eén regel, zonder uitleg en knoppen. */
  compact?: boolean;
}

type Tone = "neutral" | "accent" | "green" | "amber" | "red" | "blue";

const PHASES: Record<EidPhase, { tone: Tone; icon: IconName | null } & EidStatusText> = {
  connecting: { tone: "neutral", icon: null, title: "Verbinden met de eID-lezer…" },
  "no-bridge": {
    tone: "amber",
    icon: "download",
    title: "eID-lezer niet gevonden",
    text: "Installeer het eID-programma op deze computer en laat het openstaan. Daarna herkent deze pagina je kaartlezer vanzelf.",
  },
  "bridge-outdated": {
    tone: "amber",
    icon: "refresh",
    title: "Het eID-programma moet bijgewerkt worden",
    text: "Je gebruikt een oudere versie. Installeer de nieuwe versie; je instellingen blijven bewaard.",
  },
  "no-reader": { tone: "blue", icon: "scan", title: "Sluit een kaartlezer aan", text: "Er is geen kaartlezer gevonden." },
  "no-card": { tone: "blue", icon: "idcard", title: "Steek je eID in de lezer" },
  ready: { tone: "accent", icon: "idcard", title: "Kaart gevonden" },
  reading: { tone: "neutral", icon: null, title: "Kaart lezen…", text: "Haal de kaart er niet uit." },
  done: { tone: "green", icon: "checkCircle", title: "Kaart gelezen" },
  error: { tone: "red", icon: "alertCircle", title: "De kaart kon niet gelezen worden" },
};

type Platform = "windows" | "mac" | null;

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X|Macintosh/i.test(ua) && !/iPhone|iPad/i.test(ua)) return "mac";
  return null;
}

/**
 * EidStatus — toont waar de eID-flow staat: programma ontbreekt, geen lezer, geen kaart, lezen,
 * klaar of fout. Geef de velden van `useEid()` uit @dafkedd/eid door; het component zelf
 * hangt niet van die package af.
 */
export const EidStatus = React.forwardRef<HTMLDivElement, EidStatusProps>(function EidStatus(
  { phase, reader, error, downloads, onRead, labels, compact, className, ...rest },
  ref
) {
  const base = PHASES[phase] ?? PHASES.error;
  const custom = labels?.[phase];
  const title = custom?.title ?? base.title;
  const text = phase === "error" && error ? custom?.text ?? error.message : custom?.text ?? base.text;
  const busy = phase === "connecting" || phase === "reading";

  // Het platform is pas na de eerste render bekend, zodat server en client dezelfde HTML geven.
  const [platform, setPlatform] = React.useState<Platform>(null);
  React.useEffect(() => setPlatform(detectPlatform()), []);

  const showDownloads = (phase === "no-bridge" || phase === "bridge-outdated") && downloads;
  const links = showDownloads
    ? ([
        ["windows", "Windows", downloads.windows],
        ["mac", "macOS", downloads.mac],
      ] as const).filter(([, , href]) => Boolean(href))
    : [];
  const verb = phase === "bridge-outdated" ? "Bijwerken" : "Downloaden";

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-busy={busy || undefined}
      data-phase={phase}
      data-compact={compact ? "" : undefined}
      className={cn("lui-eid-status", `lui-eid-status-${base.tone}`, className)}
      {...rest}
    >
      <span className="lui-eid-status-icon">
        {base.icon ? <Icon name={base.icon} size={compact ? 16 : 20} /> : <Spinner size={compact ? 16 : 20} />}
      </span>
      <div className="lui-eid-status-body">
        <div className="lui-eid-status-title">{title}</div>
        {!compact && reader && phase !== "no-bridge" && phase !== "no-reader" && (
          <div className="lui-eid-status-reader">{reader}</div>
        )}
        {!compact && text && <div className="lui-eid-status-text">{text}</div>}
        {!compact && (links.length > 0 || (onRead && (phase === "ready" || phase === "error"))) && (
          <div className="lui-eid-status-actions">
            {links.map(([key, name, href]) => (
              <Button
                key={key}
                asChild
                size="sm"
                variant={platform === null || platform === key ? "primary" : "secondary"}
                icon={<Icon name="download" size={14} />}
              >
                <a href={href} download>{`${verb} voor ${name}`}</a>
              </Button>
            ))}
            {onRead && phase === "ready" && (
              <Button size="sm" onClick={onRead} icon={<Icon name="idcard" size={14} />}>
                Kaart lezen
              </Button>
            )}
            {onRead && phase === "error" && (
              <Button size="sm" variant="secondary" onClick={onRead} icon={<Icon name="refresh" size={14} />}>
                Opnieuw
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
