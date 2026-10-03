"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { Avatar } from "./avatar";
import { toSquareDataUrl } from "../lib/image";

export interface AvatarUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "onError"> {
  /** Huidige foto als URL of data-URL. */
  value?: string | null;
  /** Naam voor de initialen wanneer er geen foto is. */
  name?: string;
  size?: number;
  /** Krijgt de nieuwe data-URL, of null bij verwijderen. */
  onChange?: (dataUrl: string | null) => void;
  onError?: (message: string) => void;
  /** Zijde van de bewaarde afbeelding in pixels. */
  outputSize?: number;
  disabled?: boolean;
  /** Knoppen naast de avatar tonen. */
  showActions?: boolean;
  addLabel?: string;
  changeLabel?: string;
  removeLabel?: string;
}

/**
 * AvatarUpload — avatar met camerabadge en bestandskiezer. De afbeelding wordt
 * in de browser bijgesneden en verkleind, dus je bewaart een compacte data-URL.
 */
export const AvatarUpload = React.forwardRef<HTMLDivElement, AvatarUploadProps>(
  function AvatarUpload(
    {
      value,
      name = "",
      size = 64,
      onChange,
      onError,
      outputSize = 160,
      disabled,
      showActions = true,
      addLabel = "Foto toevoegen",
      changeLabel = "Foto wijzigen",
      removeLabel = "Verwijderen",
      className,
      ...rest
    },
    ref
  ) {
    const input = React.useRef<HTMLInputElement>(null);

    const pick = () => {
      if (!disabled) input.current?.click();
    };

    const handle = async (file?: File | null) => {
      if (!file) return;
      try {
        onChange?.(await toSquareDataUrl(file, { size: outputSize }));
      } catch (error) {
        onError?.(error instanceof Error ? error.message : "Uploaden mislukt");
      }
    };

    return (
      <div ref={ref} className={cn("lui-avatar-upload", className)} {...rest}>
        <button
          type="button"
          className="lui-avatar-upload-btn"
          onClick={pick}
          disabled={disabled}
          aria-label={value ? changeLabel : addLabel}
          title={value ? changeLabel : addLabel}
        >
          <Avatar name={name} src={value ?? undefined} size={size} />
          <span className="lui-avatar-upload-badge" style={{ width: size * 0.34, height: size * 0.34 }}>
            <Icon name="camera" size={Math.max(11, size * 0.18)} />
          </span>
        </button>

        <input
          ref={input}
          type="file"
          accept="image/*"
          className="lui-sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void handle(file);
          }}
        />

        {showActions && (
          <div className="lui-avatar-upload-actions">
            <button type="button" className="lui-avatar-upload-action" onClick={pick} disabled={disabled}>
              <Icon name="camera" size={14} />
              {value ? changeLabel : addLabel}
            </button>
            {value && (
              <button
                type="button"
                className="lui-avatar-upload-action lui-avatar-upload-remove"
                onClick={() => onChange?.(null)}
                disabled={disabled}
              >
                <Icon name="trash" size={14} />
                {removeLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
