"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export interface FileDropProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop" | "title"> {
  /** Toegestane types, bv. ".pdf,.png" of "image/*". */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** Wordt aangeroepen met de gekozen of gesleepte bestanden. */
  onFiles?: (files: File[]) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Hoogste bestandsgrootte in bytes; grotere bestanden worden geweigerd. */
  maxSize?: number;
  /** Hoogste aantal bestanden in één keer. */
  maxFiles?: number;
  /** Geweigerde bestanden, met de reden erbij. */
  onReject?: (rejected: Array<{ file: File; reason: "type" | "size" | "count" }>) => void;
  /** Eigen tekst bij een weigering; geef null voor geen melding. */
  errorMessage?: (rejected: Array<{ file: File; reason: "type" | "size" | "count" }>) => React.ReactNode;
  /** Regeltje onder de zone, bv. "PDF, DOC · max 1 MB". */
  hint?: React.ReactNode;
}

const leesbaar = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/** Kijkt of het bestand past bij het accept-patroon (".pdf", "image/*", …). */
function pastBijAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const naam = file.name.toLowerCase();
  return accept.split(",").some((deel) => {
    const patroon = deel.trim().toLowerCase();
    if (!patroon) return true;
    if (patroon.startsWith(".")) return naam.endsWith(patroon);
    if (patroon.endsWith("/*")) return file.type.startsWith(patroon.slice(0, -1));
    return file.type === patroon;
  });
}

/** FileDrop — sleepzone met bestandskiezer, grenzen en een foutmelding. */
export const FileDrop = React.forwardRef<HTMLDivElement, FileDropProps>(function FileDrop(
  {
    accept,
    multiple,
    disabled,
    onFiles,
    title = "Sleep bestanden hierheen",
    description = "of klik om te bladeren",
    icon,
    maxSize,
    maxFiles,
    onReject,
    errorMessage,
    hint,
    className,
    children,
    ...rest
  },
  ref
) {
  const [dragging, setDragging] = React.useState(false);
  const [fout, setFout] = React.useState<React.ReactNode>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handle = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const alle = Array.from(files);

    const geweigerd: Array<{ file: File; reason: "type" | "size" | "count" }> = [];
    const goed: File[] = [];
    for (const file of alle) {
      if (!pastBijAccept(file, accept)) geweigerd.push({ file, reason: "type" });
      else if (maxSize !== undefined && file.size > maxSize) geweigerd.push({ file, reason: "size" });
      else if (maxFiles !== undefined && goed.length >= maxFiles) geweigerd.push({ file, reason: "count" });
      else goed.push(file);
    }

    if (geweigerd.length > 0) {
      onReject?.(geweigerd);
      if (errorMessage) {
        setFout(errorMessage(geweigerd));
      } else {
        const eerste = geweigerd[0];
        setFout(
          eerste.reason === "type"
            ? `Alleen ${accept} is toegestaan.`
            : eerste.reason === "size"
              ? `${eerste.file.name} is groter dan ${leesbaar(maxSize ?? 0)}.`
              : `Hoogstens ${maxFiles} bestand${maxFiles === 1 ? "" : "en"} tegelijk.`
        );
      }
    } else {
      setFout(null);
    }

    if (goed.length > 0) onFiles?.(goed);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={cn("lui-filedrop", dragging && "lui-filedrop-dragging", disabled && "lui-filedrop-disabled", className)}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) handle(event.dataTransfer.files);
      }}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        className="lui-sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => handle(event.target.files)}
      />
      <span className="lui-filedrop-icon">{icon ?? <Icon name="upload" size={24} />}</span>
      <span className="lui-filedrop-title">{title}</span>
      {description && <span className="lui-filedrop-description">{description}</span>}
      {hint && <span className="lui-filedrop-hint">{hint}</span>}
      {fout && (
        <span className="lui-filedrop-error" role="alert">
          <Icon name="alertCircle" size={14} />
          {fout}
        </span>
      )}
      {children}
    </div>
  );
});

export interface FileItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: number;
  /** Uploadvoortgang 0–100; laat weg als het bestand klaar is. */
  progress?: number;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

/** FileItem — regel met bestandsnaam, grootte en verwijderknop. */
export const FileItem = React.forwardRef<HTMLDivElement, FileItemProps>(function FileItem(
  { name, size, progress, onRemove, icon, className, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-fileitem", className)} {...rest}>
      <span className="lui-fileitem-icon">{icon ?? <Icon name="file" size={17} />}</span>
      <div className="lui-fileitem-body">
        <span className="lui-fileitem-name">{name}</span>
        {size !== undefined && <span className="lui-fileitem-size">{formatBytes(size)}</span>}
        {progress !== undefined && progress < 100 && (
          <span className="lui-fileitem-progress">
            <span className="lui-fileitem-progress-bar" style={{ width: `${progress}%` }} />
          </span>
        )}
      </div>
      {onRemove && (
        <button type="button" className="lui-fileitem-remove" aria-label={`${name} verwijderen`} onClick={onRemove}>
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );
});

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
