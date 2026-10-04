"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";
import { Icon } from "../icons/icon";
import { Button } from "./button";
import { KeyValueList, KeyValue } from "./key-value";

/** De velden van `card.identity` uit @dafkedd/eid die de kaart toont. */
export interface EidCardIdentity {
  firstNames: string;
  lastName: string;
  nationalNumber?: string;
  /** Geboortedatum; jaar alleen, of jaar en maand, komt voor. */
  dateOfBirth?: { year: number; month?: number; day?: number } | null;
  placeOfBirth?: string;
  gender?: "male" | "female" | "unknown" | string;
  nationality?: string;
  cardNumber?: string;
  /** ISO-datum, bv. "2031-05-14". */
  validUntil?: string;
}

export interface EidCardAddress {
  streetAndNumber: string;
  zipCode: string;
  municipality: string;
}

export interface EidCardPhoto {
  mimeType: string;
  data: Uint8Array;
}

export interface EidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  identity: EidCardIdentity;
  address?: EidCardAddress | null;
  /** Foto als URL (bv. data-URL) of zoals @dafkedd/eid ze geeft. */
  photo?: string | EidCardPhoto | null;
  /** Gevoelige velden afgeschermd tonen. Standaard `true`. */
  masked?: boolean;
  defaultMasked?: boolean;
  onMaskedChange?: (masked: boolean) => void;
  /** Toont de knop om alles te tonen of weer af te schermen. Standaard `true`. */
  revealable?: boolean;
  /** Taal voor datums. Standaard "nl-BE". */
  locale?: string;
  /** Extra inhoud onderaan, bv. knoppen. */
  footer?: React.ReactNode;
}

const DOT = "•";

/** Vervangt elk cijfer of letter door een stip, behalve de laatste `keep` tekens. */
function mask(value: string, keep = 0): string {
  let seen = 0;
  const total = value.replace(/[^0-9a-z]/gi, "").length;
  return value.replace(/[0-9a-z]/gi, (ch) => (++seen > total - keep ? ch : DOT));
}

function formatNationalNumber(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 4)}.${d.slice(4, 6)}-${d.slice(6, 9)}.${d.slice(9)}`;
}

function formatCardNumber(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length !== 12) return value;
  return `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}`;
}

function formatDate(
  date: { year: number; month?: number; day?: number },
  locale: string,
  maskDay: boolean
): string {
  if (maskDay || date.month === undefined) return String(date.year);
  const value = new Date(Date.UTC(date.year, date.month - 1, date.day ?? 1));
  const options: Intl.DateTimeFormatOptions =
    date.day === undefined
      ? { year: "numeric", month: "long", timeZone: "UTC" }
      : { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
  return value.toLocaleDateString(locale, options);
}

function isoToDate(value: string): { year: number; month?: number; day?: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) } : null;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

const GENDER: Record<string, string> = { male: "Man", female: "Vrouw", unknown: "Onbekend" };

/**
 * EidCard — toont de gegevens van een gelezen Belgische eID. Rijksregisternummer, kaartnummer,
 * geboortedag en adres staan standaard afgeschermd; de gebruiker kan ze zelf tonen.
 * Geef `card.identity`, `card.address` en `card.photo` uit `useEid()` door.
 */
export const EidCard = React.forwardRef<HTMLDivElement, EidCardProps>(function EidCard(
  {
    identity,
    address,
    photo,
    masked,
    defaultMasked = true,
    onMaskedChange,
    revealable = true,
    locale = "nl-BE",
    footer,
    className,
    ...rest
  },
  ref
) {
  const [isMasked, setMasked] = useControllableState<boolean>({
    value: masked,
    defaultValue: defaultMasked,
    onChange: onMaskedChange,
  });

  const photoSrc = React.useMemo(() => {
    if (!photo) return undefined;
    if (typeof photo === "string") return photo;
    return `data:${photo.mimeType};base64,${toBase64(photo.data)}`;
  }, [photo]);

  const name = [identity.firstNames, identity.lastName].filter(Boolean).join(" ");
  const nn = identity.nationalNumber ? formatNationalNumber(identity.nationalNumber) : undefined;
  const cardNr = identity.cardNumber ? formatCardNumber(identity.cardNumber) : undefined;
  const validUntil = identity.validUntil ? isoToDate(identity.validUntil) : null;

  return (
    <div ref={ref} className={cn("lui-eid-card", className)} data-masked={isMasked ? "" : undefined} {...rest}>
      <div className="lui-eid-card-head">
        <div className="lui-eid-card-photo">
          {photoSrc ? (
            <img src={photoSrc} alt={`Foto van ${name}`} data-blurred={isMasked ? "" : undefined} />
          ) : (
            <Icon name="user" size={30} />
          )}
        </div>
        <div className="lui-eid-card-name">
          <span className="lui-eid-card-label">Belgische eID</span>
          <strong>{name}</strong>
          {nn && <span className="lui-eid-card-nn">{isMasked ? mask(nn, 2) : nn}</span>}
        </div>
        {revealable && (
          <Button
            variant="ghost"
            size="sm"
            className="lui-eid-card-toggle"
            aria-pressed={!isMasked}
            icon={<Icon name={isMasked ? "lock" : "shield"} size={14} />}
            onClick={() => setMasked(!isMasked)}
          >
            {isMasked ? "Toon alles" : "Afschermen"}
          </Button>
        )}
      </div>

      <KeyValueList horizontal dense divided labelWidth="42%" className="lui-eid-card-fields">
        {identity.dateOfBirth && (
          <KeyValue label="Geboren">
            {formatDate(identity.dateOfBirth, locale, isMasked)}
            {identity.placeOfBirth && !isMasked ? ` in ${identity.placeOfBirth}` : ""}
          </KeyValue>
        )}
        {identity.gender && <KeyValue label="Geslacht">{GENDER[identity.gender] ?? identity.gender}</KeyValue>}
        {identity.nationality && <KeyValue label="Nationaliteit">{identity.nationality}</KeyValue>}
        {address && (
          <KeyValue label="Adres">
            {isMasked
              ? `${mask(address.streetAndNumber)}, ${address.zipCode} ${address.municipality}`
              : `${address.streetAndNumber}, ${address.zipCode} ${address.municipality}`}
          </KeyValue>
        )}
        {cardNr && <KeyValue label="Kaartnummer">{isMasked ? mask(cardNr, 2) : cardNr}</KeyValue>}
        {validUntil && <KeyValue label="Geldig tot">{formatDate(validUntil, locale, false)}</KeyValue>}
      </KeyValueList>

      {footer && <div className="lui-eid-card-footer">{footer}</div>}
    </div>
  );
});
