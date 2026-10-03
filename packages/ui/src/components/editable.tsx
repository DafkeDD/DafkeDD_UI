"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";
import { useControllableState } from "../lib/hooks";

export interface EditableProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Bevestigen; geef false terug om de bewerking open te houden. */
  onSubmit?: (value: string) => void | boolean | Promise<void | boolean>;
  onCancel?: () => void;
  placeholder?: string;
  /** Meerdere regels: bevestigen met Cmd/Ctrl+Enter. */
  multiline?: boolean;
  rows?: number;
  /** Opslaan zodra het veld de focus verliest; anders wordt er geannuleerd. */
  submitOnBlur?: boolean;
  /** Knoppen tonen in plaats van alleen toetsen. */
  showActions?: boolean;
  /** Potloodje bij het zweven over de tekst. */
  showIcon?: boolean;
  disabled?: boolean;
  /** Open of dicht van buitenaf sturen. */
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  size?: "sm" | "md" | "lg";
  /** Eigen weergave van de tekst als er niet bewerkt wordt. */
  renderValue?: (value: string) => React.ReactNode;
  label?: string;
  maxLength?: number;
}

/**
 * Editable — tekst die je ter plekke bewerkt. Klik of Enter opent het veld,
 * Enter bevestigt, Escape annuleert en zet de oude waarde terug.
 */
export const Editable = React.forwardRef<HTMLDivElement, EditableProps>(function Editable(
  {
    value,
    defaultValue = "",
    onValueChange,
    onSubmit,
    onCancel,
    placeholder = "Leeg",
    multiline,
    rows = 3,
    submitOnBlur = true,
    showActions,
    showIcon = true,
    disabled,
    editing,
    defaultEditing,
    onEditingChange,
    size = "md",
    renderValue,
    label,
    maxLength,
    className,
    ...rest
  },
  ref
) {
  const [waarde, setWaarde] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: editing,
    defaultValue: defaultEditing ?? false,
    onChange: onEditingChange,
  });

  const [concept, setConcept] = React.useState(waarde);
  const [bezig, setBezig] = React.useState(false);
  const veld = React.useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  /* Blur na een klik op Annuleren mag niet alsnog opslaan. */
  const negeerBlur = React.useRef(false);

  const start = () => {
    if (disabled) return;
    setConcept(waarde);
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) return;
    const el = veld.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [open]);

  const bevestig = async () => {
    const schoon = concept.trim();
    if (onSubmit) {
      setBezig(true);
      try {
        const uitkomst = await onSubmit(schoon);
        if (uitkomst === false) return;
      } finally {
        setBezig(false);
      }
    }
    setWaarde(schoon);
    setOpen(false);
  };

  const annuleer = () => {
    setConcept(waarde);
    setOpen(false);
    onCancel?.();
  };

  const opToets = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      negeerBlur.current = true;
      annuleer();
      return;
    }
    if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      negeerBlur.current = true;
      void bevestig();
    }
  };

  const opBlur = () => {
    if (negeerBlur.current) {
      negeerBlur.current = false;
      return;
    }
    if (submitOnBlur) void bevestig();
    else annuleer();
  };

  const gedeeld = {
    ref: veld as React.RefObject<never>,
    value: concept,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setConcept(event.target.value),
    onKeyDown: opToets,
    onBlur: opBlur,
    placeholder,
    disabled: bezig,
    maxLength,
    "aria-label": label,
    className: "lui-editable-input",
  };

  return (
    <div
      ref={ref}
      className={cn("lui-editable", `lui-editable-${size}`, open && "lui-editable-open", className)}
      data-disabled={disabled ? "" : undefined}
      {...rest}
    >
      {open ? (
        <div className="lui-editable-edit">
          {multiline ? <textarea {...gedeeld} rows={rows} /> : <input {...gedeeld} type="text" />}
          {showActions && (
            <div className="lui-editable-actions">
              <button
                type="button"
                className="lui-editable-btn"
                data-primary=""
                onMouseDown={() => (negeerBlur.current = true)}
                onClick={() => void bevestig()}
                disabled={bezig}
                aria-label="Opslaan"
              >
                <Icon name="check" size={15} />
              </button>
              <button
                type="button"
                className="lui-editable-btn"
                onMouseDown={() => (negeerBlur.current = true)}
                onClick={annuleer}
                aria-label="Annuleren"
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="lui-editable-preview"
          onClick={start}
          disabled={disabled}
          aria-label={label ? `${label} bewerken` : "Bewerken"}
        >
          <span className={cn("lui-editable-text", !waarde && "lui-editable-placeholder")}>
            {waarde ? renderValue?.(waarde) ?? waarde : placeholder}
          </span>
          {showIcon && !disabled && <Icon name="edit" size={14} className="lui-editable-icon" />}
        </button>
      )}
    </div>
  );
});
