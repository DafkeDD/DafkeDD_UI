"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";
import { useFieldProps } from "./field";

export interface TagsInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  size?: "sm" | "md" | "lg";
  /** Maximaal aantal tags; daarna verdwijnt het invoerveld. */
  max?: number;
  /** Tekens die een tag afsluiten, naast Enter. */
  delimiters?: string[];
  /** Keurt een tag goed of af (bv. een e-mailcheck). */
  validate?: (tag: string) => boolean;
  /** Dezelfde tag twee keer toelaten. */
  allowDuplicates?: boolean;
  /** Suggesties in een datalist. */
  suggestions?: string[];
  invalid?: boolean;
  /** Eigen weergave van een tag. */
  renderTag?: (tag: string, index: number) => React.ReactNode;
}

/**
 * TagsInput — typ een waarde, druk op Enter en ze wordt een chip. Backspace in
 * een leeg veld haalt de laatste weer weg; plakken splitst op de scheidingstekens.
 */
export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(function TagsInput(
  {
    value,
    defaultValue = [],
    onValueChange,
    size = "md",
    max,
    delimiters = [",", ";"],
    validate,
    allowDuplicates,
    suggestions,
    invalid,
    renderTag,
    disabled,
    placeholder = "Typ en druk op Enter…",
    className,
    ...props
  },
  ref
) {
  const merged = useFieldProps(props as Parameters<typeof useFieldProps>[0]) as typeof props & {
    invalid?: boolean;
  };
  const { invalid: veldFout, id, ...rest } = merged;
  const fout = invalid ?? veldFout;

  const [tags, setTags] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [tekst, setTekst] = React.useState("");
  const veld = React.useRef<HTMLInputElement | null>(null);
  const lijstId = React.useId();

  const vol = max !== undefined && tags.length >= max;

  /** Alles in één update, anders overschrijft de tweede tag de eerste. */
  const voegToe = (...ruwe: string[]) => {
    setTags((vorige) => {
      const volgende = [...vorige];
      for (const ruw of ruwe) {
        const tag = ruw.trim();
        if (!tag) continue;
        if (max !== undefined && volgende.length >= max) break;
        if (!allowDuplicates && volgende.includes(tag)) continue;
        if (validate && !validate(tag)) continue;
        volgende.push(tag);
      }
      return volgende;
    });
  };

  const verwijder = (index: number) => setTags((vorige) => vorige.filter((_, i) => i !== index));

  const opToets = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || delimiters.includes(event.key)) {
      event.preventDefault();
      voegToe(tekst);
      setTekst("");
    } else if (event.key === "Backspace" && tekst === "" && tags.length > 0) {
      verwijder(tags.length - 1);
    }
  };

  return (
    <div
      className={cn("lui-tagsinput", `lui-tagsinput-${size}`, fout && "lui-tagsinput-invalid", className)}
      data-disabled={disabled ? "" : undefined}
      onClick={() => veld.current?.focus()}
    >
      {tags.map((tag, index) =>
        renderTag ? (
          <React.Fragment key={`${tag}-${index}`}>{renderTag(tag, index)}</React.Fragment>
        ) : (
          <span key={`${tag}-${index}`} className="lui-tagsinput-tag">
            {tag}
            {!disabled && (
              <button
                type="button"
                aria-label={`${tag} verwijderen`}
                onClick={(event) => {
                  event.stopPropagation();
                  verwijder(index);
                }}
              >
                <Icon name="x" size={12} strokeWidth={2.5} />
              </button>
            )}
          </span>
        )
      )}

      {!vol && (
        <input
          ref={(node) => {
            veld.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
          }}
          id={id}
          className="lui-tagsinput-input"
          value={tekst}
          disabled={disabled}
          placeholder={tags.length === 0 ? placeholder : ""}
          aria-invalid={fout || undefined}
          list={suggestions ? lijstId : undefined}
          onKeyDown={opToets}
          onChange={(event) => {
            const invoer = event.target.value;
            const scheiding = delimiters.find((teken) => invoer.includes(teken));
            if (scheiding) {
              voegToe(...invoer.split(scheiding));
              setTekst("");
              return;
            }
            setTekst(invoer);
          }}
          onBlur={(event) => {
            voegToe(tekst);
            setTekst("");
            rest.onBlur?.(event);
          }}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {suggestions && (
        <datalist id={lijstId}>
          {suggestions.map((optie) => (
            <option key={optie} value={optie} />
          ))}
        </datalist>
      )}
    </div>
  );
});
