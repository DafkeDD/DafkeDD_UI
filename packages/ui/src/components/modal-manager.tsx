"use client";
import * as React from "react";

/**
 * Imperatieve dialogs — één register, overal openen met `useModal()`.
 *
 *   const MODALS = createModals({
 *     voorschrift: VoorschriftModal,
 *     brief: BriefModal,
 *   });
 *
 *   <ModalProvider modals={MODALS}>…</ModalProvider>
 *
 *   const modal = useModal<typeof MODALS>();
 *   modal.open("voorschrift", { patientId: "abc" });
 *
 * Elk geregistreerd component krijgt zijn eigen props plus `onClose`, en rendert
 * zelf een <Dialog open …> (of een Drawer). De declaratieve <Dialog> blijft
 * gewoon bestaan — dit is een extra laag, geen vervanging.
 */

export type ModalComponent<P = Record<string, never>> = React.ComponentType<P & { onClose: () => void }>;

export type ModalRegistry = Record<string, ModalComponent<never>>;

type PropsOf<R extends ModalRegistry, K extends keyof R> =
  R[K] extends React.ComponentType<infer P> ? Omit<P, "onClose"> : never;

export interface OpenModal {
  id: string;
  kind: string;
  props: Record<string, unknown>;
}

export interface ModalApi<R extends ModalRegistry = ModalRegistry> {
  /** Opent een dialog en geeft zijn id terug. */
  open<K extends keyof R>(kind: K, props?: PropsOf<R, K>): string;
  /** Sluit de bovenste dialog, of die met dit id. */
  close: (id?: string) => void;
  /** Sluit alles. */
  closeAll: () => void;
  /** Vervangt de bovenste dialog door een andere. */
  replace<K extends keyof R>(kind: K, props?: PropsOf<R, K>): string;
  /** Staat er iets open (eventueel: van deze soort)? */
  isOpen: (kind?: keyof R) => boolean;
  /** De dialogs die nu open staan, onderste eerst. */
  stack: OpenModal[];
}

const ModalContext = React.createContext<ModalApi<ModalRegistry> | null>(null);

/** Bewaart de typering van je register, zodat open() de juiste props verwacht. */
export function createModals<R extends ModalRegistry>(modals: R): R {
  return modals;
}

export interface ModalProviderProps<R extends ModalRegistry> {
  modals: R;
  children: React.ReactNode;
  /** Maximaal aantal dialogs boven elkaar. */
  maxStack?: number;
}

export function ModalProvider<R extends ModalRegistry>({
  modals,
  children,
  maxStack = 3,
}: ModalProviderProps<R>) {
  const [stack, setStack] = React.useState<OpenModal[]>([]);
  const counter = React.useRef(0);

  const api = React.useMemo<ModalApi<R>>(() => {
    const open = (kind: keyof R, props?: Record<string, unknown>) => {
      counter.current += 1;
      const id = `lui-modal-${counter.current}`;
      setStack((prev) => [...prev, { id, kind: String(kind), props: props ?? {} }].slice(-maxStack));
      return id;
    };

    const close = (id?: string) => {
      setStack((prev) => (id ? prev.filter((entry) => entry.id !== id) : prev.slice(0, -1)));
    };

    return {
      open: open as ModalApi<R>["open"],
      close,
      closeAll: () => setStack([]),
      replace: ((kind: keyof R, props?: Record<string, unknown>) => {
        setStack((prev) => prev.slice(0, -1));
        return open(kind, props);
      }) as ModalApi<R>["replace"],
      isOpen: (kind?: keyof R) =>
        kind === undefined ? stack.length > 0 : stack.some((entry) => entry.kind === String(kind)),
      stack,
    };
  }, [stack, maxStack]);

  return (
    <ModalContext.Provider value={api as unknown as ModalApi<ModalRegistry>}>
      {children}
      {stack.map((entry) => {
        const Component = modals[entry.kind] as ModalComponent<Record<string, unknown>> | undefined;
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[dafke-ui] Onbekende modal: "${entry.kind}"`);
          }
          return null;
        }
        return (
          <Component
            key={entry.id}
            {...entry.props}
            onClose={() => api.close(entry.id)}
          />
        );
      })}
    </ModalContext.Provider>
  );
}

/** useModal — dialogs openen en sluiten vanuit elk component onder de provider. */
export function useModal<R extends ModalRegistry = ModalRegistry>(): ModalApi<R> {
  const context = React.useContext(ModalContext);
  if (!context) throw new Error("useModal() vereist een <ModalProvider> hoger in de boom.");
  return context as unknown as ModalApi<R>;
}
