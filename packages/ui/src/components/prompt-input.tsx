"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

export interface PromptAttachment {
  id: string;
  name: string;
  /** Grootte in bytes; wordt zelf leesbaar gemaakt. */
  size?: number;
  /** Icoonnaam of eigen element links in het chipje. */
  icon?: React.ReactNode;
}

export interface PromptInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Versturen met Enter of de knop. */
  onSubmit?: (value: string) => void;
  /** Toont een stopknop in plaats van versturen. */
  streaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Hoogste aantal regels voordat het veld gaat scrollen. */
  maxRows?: number;
  minRows?: number;
  /** Bijlagen boven het veld. */
  attachments?: PromptAttachment[];
  onRemoveAttachment?: (id: string) => void;
  /** Paperclip tonen. */
  onAttach?: () => void;
  /** Knoppen links onderaan, bv. een modelkiezer. */
  toolbar?: React.ReactNode;
  /** Tekst rechts onderaan, bv. een teller of sneltoets. */
  hint?: React.ReactNode;
  /** Hoogste aantal tekens; toont een teller zodra je in de buurt komt. */
  maxLength?: number;
  /** Suggesties boven het veld die het veld invullen. */
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  autoFocus?: boolean;
  label?: string;
}

const leesbaar = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * PromptInput — invoerveld voor een gesprek met een model: groeit mee met de
 * tekst, Enter verstuurt, Shift+Enter maakt een regel, en tijdens het
 * antwoorden wordt de knop een stopknop.
 */
export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  function PromptInput(
    {
      value,
      defaultValue = "",
      onValueChange,
      onSubmit,
      streaming,
      onStop,
      placeholder = "Stel een vraag…",
      disabled,
      maxRows = 10,
      minRows = 1,
      attachments,
      onRemoveAttachment,
      onAttach,
      toolbar,
      hint,
      maxLength,
      suggestions,
      onSuggestionSelect,
      autoFocus,
      label = "Bericht",
      className,
      ...rest
    },
    ref
  ) {
    const [tekst, setTekst] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
    });

    const veld = React.useRef<HTMLTextAreaElement>(null);
    const zetRef = (node: HTMLTextAreaElement | null) => {
      (veld as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    };

    /* Meegroeien: hoogte eerst terugzetten, anders krimpt het veld nooit. */
    React.useLayoutEffect(() => {
      const el = veld.current;
      if (!el) return;
      el.style.height = "auto";
      const regel = parseFloat(getComputedStyle(el).lineHeight) || 20;
      const rand = el.offsetHeight - el.clientHeight;
      el.style.height = `${Math.min(el.scrollHeight, regel * maxRows + rand)}px`;
    }, [tekst, maxRows]);

    const verstuur = () => {
      const schoon = tekst.trim();
      if (!schoon || disabled || streaming) return;
      onSubmit?.(schoon);
      if (value === undefined) setTekst("");
    };

    const teller = maxLength !== undefined && tekst.length > maxLength * 0.8;

    return (
      <div
        className={cn("lui-prompt", disabled && "lui-prompt-disabled", className)}
        data-streaming={streaming ? "" : undefined}
        {...rest}
      >
        {suggestions && suggestions.length > 0 && !tekst && (
          <div className="lui-prompt-suggestions">
            {suggestions.map((suggestie) => (
              <button
                key={suggestie}
                type="button"
                className="lui-prompt-suggestion"
                onClick={() => {
                  setTekst(suggestie);
                  onSuggestionSelect?.(suggestie);
                  veld.current?.focus();
                }}
              >
                {suggestie}
              </button>
            ))}
          </div>
        )}

        <div className="lui-prompt-box">
          {attachments && attachments.length > 0 && (
            <div className="lui-prompt-files">
              {attachments.map((bijlage) => (
                <span className="lui-prompt-file" key={bijlage.id}>
                  {bijlage.icon ?? <Icon name="file" size={14} />}
                  <span className="lui-prompt-file-name">{bijlage.name}</span>
                  {bijlage.size !== undefined && (
                    <span className="lui-prompt-file-size">{leesbaar(bijlage.size)}</span>
                  )}
                  {onRemoveAttachment && (
                    <button
                      type="button"
                      className="lui-prompt-file-x"
                      onClick={() => onRemoveAttachment(bijlage.id)}
                      aria-label={`${bijlage.name} verwijderen`}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          <textarea
            ref={zetRef}
            className="lui-prompt-field"
            rows={minRows}
            value={tekst}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            autoFocus={autoFocus}
            aria-label={label}
            onChange={(event) => setTekst(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                verstuur();
              }
            }}
          />

          <div className="lui-prompt-bar">
            <div className="lui-prompt-tools">
              {onAttach && (
                <button
                  type="button"
                  className="lui-prompt-tool"
                  onClick={onAttach}
                  disabled={disabled}
                  aria-label="Bestand toevoegen"
                >
                  <Icon name="link" size={16} />
                </button>
              )}
              {toolbar}
            </div>

            <div className="lui-prompt-right">
              {maxLength !== undefined && teller && (
                <span className="lui-prompt-count" data-over={tekst.length >= maxLength ? "" : undefined}>
                  {tekst.length}/{maxLength}
                </span>
              )}
              {hint && <span className="lui-prompt-hint">{hint}</span>}
              {streaming ? (
                <button type="button" className="lui-prompt-send" data-stop="" onClick={onStop} aria-label="Stoppen">
                  <span className="lui-prompt-stop" />
                </button>
              ) : (
                <button
                  type="button"
                  className="lui-prompt-send"
                  onClick={verstuur}
                  disabled={disabled || !tekst.trim()}
                  aria-label="Versturen"
                >
                  <Icon name="arrowUp" size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
