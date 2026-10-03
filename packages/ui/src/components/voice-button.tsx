"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useVoice, type UseVoiceOptions } from "../lib/use-voice";

export interface VoiceButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onError">,
    UseVoiceOptions {
  size?: "sm" | "md" | "lg";
  /** Wat te doen wanneer de browser geen spraak ondersteunt. */
  whenUnsupported?: "hide" | "disable" | "show";
  labelStart?: string;
  labelStop?: string;
}

/**
 * VoiceButton — microfoonknop die intikt op de spraakherkenning van de browser.
 * Toont een puls zolang er geluisterd wordt.
 */
export const VoiceButton = React.forwardRef<HTMLButtonElement, VoiceButtonProps>(
  function VoiceButton(
    {
      lang,
      continuous,
      onInterim,
      onFinal,
      onNotice,
      size = "md",
      whenUnsupported = "hide",
      labelStart = "Inspreken",
      labelStop = "Stop met luisteren",
      className,
      onClick,
      ...rest
    },
    ref
  ) {
    const voice = useVoice({ lang, continuous, onInterim, onFinal, onNotice });

    if (!voice.supported && whenUnsupported === "hide") return null;

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={voice.listening}
        aria-label={voice.listening ? labelStop : labelStart}
        title={voice.listening ? labelStop : labelStart}
        disabled={!voice.supported && whenUnsupported === "disable"}
        data-listening={voice.listening ? "" : undefined}
        className={cn("lui-voice", `lui-voice-${size}`, className)}
        onClick={(event) => {
          onClick?.(event);
          voice.toggle();
        }}
        {...rest}
      >
        <Icon name="mic" size={size === "sm" ? 15 : size === "lg" ? 20 : 18} />
        {voice.listening && <span className="lui-voice-pulse" aria-hidden="true" />}
      </button>
    );
  }
);
