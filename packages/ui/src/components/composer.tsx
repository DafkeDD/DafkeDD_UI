"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { VoiceButton } from "./voice-button";

export interface ComposerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  /** Wordt aangeroepen bij Enter of een klik op de knop. */
  onSubmit: (text: string) => void;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Tekst op de knop; laat leeg voor alleen een plus-icoon. */
  submitLabel?: React.ReactNode;
  /** Snelkeuzes onder het veld, bv. deadlines of labels. */
  children?: React.ReactNode;
  /** Microfoonknop tonen. */
  voice?: boolean;
  /** Taal van de spraakherkenning. */
  voiceLang?: string;
  /** Ingesproken tekst meteen toevoegen in plaats van in het veld zetten. */
  voiceAutoSubmit?: boolean;
  /** Meldingen van de spraakherkenning. */
  onVoiceNotice?: (message: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Composer — invoerbalk om snel iets toe te voegen: veld, optionele
 * microfoon, toevoegknop en een rij snelkeuzes eronder.
 */
export const Composer = React.forwardRef<HTMLInputElement, ComposerProps>(function Composer(
  {
    onSubmit,
    value,
    onValueChange,
    placeholder = "Iets toevoegen…",
    submitLabel = "Toevoegen",
    children,
    voice = true,
    voiceLang,
    voiceAutoSubmit = true,
    onVoiceNotice,
    disabled,
    autoFocus,
    className,
    ...rest
  },
  ref
) {
  const [internal, setInternal] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const text = value ?? internal;
  const input = React.useRef<HTMLInputElement | null>(null);

  const setText = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  const submit = (raw?: string) => {
    const clean = (raw ?? text).trim();
    if (!clean) return;
    onSubmit(clean);
    setText("");
    input.current?.focus();
  };

  const capitalise = (sentence: string) => sentence.charAt(0).toUpperCase() + sentence.slice(1);

  return (
    <div className={cn("lui-composer", className)} {...rest}>
      <div className={cn("lui-composer-box", listening && "lui-composer-listening")}>
        <input
          ref={(node) => {
            input.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
          }}
          className="lui-composer-input"
          placeholder={listening ? "Aan het luisteren…" : placeholder}
          value={text}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
        />

        {voice && (
          <VoiceButton
            size="sm"
            lang={voiceLang}
            className="lui-composer-voice"
            onInterim={(spoken) => {
              setListening(true);
              setText(capitalise(spoken));
            }}
            onFinal={(spoken) => {
              setListening(false);
              const sentence = capitalise(spoken);
              if (voiceAutoSubmit) submit(sentence);
              else setText(sentence);
            }}
            onNotice={(message) => {
              setListening(false);
              onVoiceNotice?.(message);
            }}
          />
        )}

        <button
          type="button"
          className="lui-composer-submit"
          disabled={disabled || !text.trim()}
          onClick={() => submit()}
        >
          <Icon name="plus" size={17} />
          {submitLabel && <span className="lui-composer-submit-label">{submitLabel}</span>}
        </button>
      </div>

      {children && <div className="lui-composer-quick">{children}</div>}
    </div>
  );
});
