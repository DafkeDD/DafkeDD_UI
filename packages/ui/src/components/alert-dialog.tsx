"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/hooks";
import { Button } from "./button";
import { Icon, type IconName } from "../icons/icon";
import { Dialog, DialogContent } from "./dialog";

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra inhoud tussen de tekst en de knoppen. */
  children?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** Rode bevestigknop en waarschuwingsicoon, voor onomkeerbare acties. */
  destructive?: boolean;
  icon?: IconName | null;
  /**
   * Wordt aangeroepen als de gebruiker bevestigt. Geef je een belofte terug,
   * dan blijft de knop laden tot ze klaar is en sluit de dialoog daarna.
   */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  className?: string;
}

/**
 * AlertDialog — bevestiging voor een actie die je niet zomaar terugdraait.
 * Anders dan Dialog: geen kruisje, klik naast de dialoog sluit niet, en de
 * focus staat op Annuleren.
 */
export function AlertDialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Bevestigen",
  cancelLabel = "Annuleren",
  destructive,
  icon,
  onConfirm,
  onCancel,
  className,
}: AlertDialogProps) {
  const [isOpen, setIsOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [bezig, setBezig] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen) window.setTimeout(() => cancelRef.current?.focus(), 0);
  }, [isOpen]);

  const naam = icon === null ? null : (icon ?? (destructive ? "alert" : "help"));

  const bevestig = async () => {
    try {
      setBezig(true);
      await onConfirm?.();
      setIsOpen(false);
    } finally {
      setBezig(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        size="sm"
        hideClose
        static
        role="alertdialog"
        className={cn("lui-alert-dialog", className)}
      >
        <div className="lui-alert-dialog-body">
          {naam && (
            <span className={cn("lui-alert-dialog-icon", destructive && "lui-alert-dialog-icon-danger")}>
              <Icon name={naam} size={20} />
            </span>
          )}
          <div className="lui-alert-dialog-text">
            <h2 className="lui-alert-dialog-title">{title}</h2>
            {description && <p className="lui-alert-dialog-description">{description}</p>}
            {children}
          </div>
        </div>

        <div className="lui-alert-dialog-actions">
          <Button
            ref={cancelRef}
            variant="secondary"
            disabled={bezig}
            onClick={() => {
              onCancel?.();
              setIsOpen(false);
            }}
          >
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "danger" : "primary"} loading={bezig} onClick={bevestig}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* useConfirm — bevestigen zonder zelf state bij te houden             */
/* ------------------------------------------------------------------ */
type ConfirmOptions = Omit<AlertDialogProps, "open" | "defaultOpen" | "onOpenChange" | "onConfirm" | "onCancel">;

const ConfirmContext = React.createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/** Zet dit een keer bovenaan je app; daarna werkt useConfirm overal eronder. */
export function ConfirmProvider({ children }: { children?: React.ReactNode }) {
  const [vraag, setVraag] = React.useState<ConfirmOptions | null>(null);
  const antwoord = React.useRef<(waarde: boolean) => void>(undefined);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    setVraag(options);
    return new Promise<boolean>((resolve) => {
      antwoord.current = resolve;
    });
  }, []);

  const sluit = (waarde: boolean) => {
    antwoord.current?.(waarde);
    antwoord.current = undefined;
    setVraag(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {vraag && (
        <AlertDialog
          {...vraag}
          open
          onOpenChange={(next) => {
            if (!next) sluit(false);
          }}
          onConfirm={() => sluit(true)}
          onCancel={() => sluit(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

/**
 * const confirm = useConfirm();
 * if (await confirm({ title: "Afspraak verwijderen?", destructive: true })) { … }
 */
export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const context = React.useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm() heeft een <ConfirmProvider> nodig.");
  return context;
}
