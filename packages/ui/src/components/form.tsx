"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Field, type FieldProps } from "./field";

/* --------------------------------- regels -------------------------------- */

export type ValidationResult = string | null | undefined | false;

/** Eén controle op een waarde; geeft de foutmelding terug, of niets als het klopt. */
export type Validator<V = unknown, Values = Record<string, unknown>> = (
  value: V,
  values: Values
) => ValidationResult;

export type FormErrors<Values> = Partial<Record<keyof Values & string, string>>;
export type FormTouched<Values> = Partial<Record<keyof Values & string, boolean>>;

/** Kant-en-klare regels; ze zijn gewoon functies, dus je schrijft er zelf bij. */
export const rules = {
  required:
    (bericht = "Dit veld is verplicht"): Validator<unknown> =>
    (waarde) => {
      if (waarde === null || waarde === undefined) return bericht;
      if (typeof waarde === "string" && waarde.trim() === "") return bericht;
      if (Array.isArray(waarde) && waarde.length === 0) return bericht;
      if (waarde === false) return bericht;
      return null;
    },
  minLength:
    (lengte: number, bericht?: string): Validator<unknown> =>
    (waarde) =>
      typeof waarde === "string" && waarde.length > 0 && waarde.length < lengte
        ? bericht ?? `Minstens ${lengte} tekens`
        : null,
  maxLength:
    (lengte: number, bericht?: string): Validator<unknown> =>
    (waarde) =>
      typeof waarde === "string" && waarde.length > lengte ? bericht ?? `Hoogstens ${lengte} tekens` : null,
  email:
    (bericht = "Geen geldig e-mailadres"): Validator<unknown> =>
    (waarde) =>
      typeof waarde === "string" && waarde !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(waarde)
        ? bericht
        : null,
  pattern:
    (patroon: RegExp, bericht = "Ongeldige invoer"): Validator<unknown> =>
    (waarde) => (typeof waarde === "string" && waarde !== "" && !patroon.test(waarde) ? bericht : null),
  min:
    (grens: number, bericht?: string): Validator<unknown> =>
    (waarde) =>
      typeof waarde === "number" && waarde < grens ? bericht ?? `Minstens ${grens}` : null,
  max:
    (grens: number, bericht?: string): Validator<unknown> =>
    (waarde) => (typeof waarde === "number" && waarde > grens ? bericht ?? `Hoogstens ${grens}` : null),
  /** Moet gelijk zijn aan een ander veld, bv. een wachtwoordbevestiging. */
  matches:
    <Values extends Record<string, unknown>>(
      veld: keyof Values & string,
      bericht = "Komt niet overeen"
    ): Validator<unknown, Values> =>
    (waarde, waarden) =>
      waarde !== waarden[veld] ? bericht : null,
};

/* ---------------------------------- hook --------------------------------- */

export interface UseFormOptions<Values extends Record<string, unknown>> {
  initialValues: Values;
  /** Eén of meer regels per veld. */
  validate?: { [K in keyof Values & string]?: Validator<Values[K], Values> | Array<Validator<Values[K], Values>> };
  /** Eigen controle over het hele formulier, bv. voor afhankelijkheden. */
  validateAll?: (values: Values) => FormErrors<Values>;
  onSubmit?: (values: Values) => void | Promise<void>;
  /** Pas valideren nadat een veld aangeraakt is (standaard) of meteen. */
  validateOn?: "blur" | "change";
}

export interface UseFormReturn<Values extends Record<string, unknown>> {
  values: Values;
  errors: FormErrors<Values>;
  touched: FormTouched<Values>;
  submitting: boolean;
  /** True zodra er ergens een fout staat. */
  invalid: boolean;
  /** True zolang er niets gewijzigd is sinds de laatste reset. */
  pristine: boolean;
  setValue: <K extends keyof Values & string>(veld: K, waarde: Values[K]) => void;
  setValues: (waarden: Partial<Values>) => void;
  setError: (veld: keyof Values & string, bericht?: string) => void;
  setTouched: (veld: keyof Values & string, aangeraakt?: boolean) => void;
  reset: (waarden?: Values) => void;
  validateField: (veld: keyof Values & string) => string | undefined;
  validateForm: () => FormErrors<Values>;
  handleSubmit: (event?: React.FormEvent) => void;
  /** Props voor Field: label geef je zelf mee. */
  fieldProps: (veld: keyof Values & string) => { error?: string };
  /** Props voor een gewoon input-element met value en onChange. */
  inputProps: (veld: keyof Values & string) => {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
  };
}

/**
 * useForm — waarden, fouten en aanraakstatus van één formulier, zonder
 * dependency. Validatie draait op het moment dat je kiest en bij het versturen
 * altijd over alles.
 */
export function useForm<Values extends Record<string, unknown>>(
  options: UseFormOptions<Values>
): UseFormReturn<Values> {
  const { initialValues, validate, validateAll, onSubmit, validateOn = "blur" } = options;

  const [values, setValuesState] = React.useState<Values>(initialValues);
  const [errors, setErrors] = React.useState<FormErrors<Values>>({});
  const [touched, setTouchedState] = React.useState<FormTouched<Values>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [pristine, setPristine] = React.useState(true);

  const beginRef = React.useRef(initialValues);

  const controleerVeld = React.useCallback(
    (veld: keyof Values & string, waarden: Values): string | undefined => {
      const regel = validate?.[veld];
      if (!regel) return undefined;
      const lijst = Array.isArray(regel) ? regel : [regel];
      for (const controle of lijst) {
        const uitkomst = controle(waarden[veld], waarden);
        if (uitkomst) return uitkomst;
      }
      return undefined;
    },
    [validate]
  );

  const controleerAlles = React.useCallback(
    (waarden: Values): FormErrors<Values> => {
      const gevonden: FormErrors<Values> = {};
      for (const veld of Object.keys(waarden) as Array<keyof Values & string>) {
        const fout = controleerVeld(veld, waarden);
        if (fout) gevonden[veld] = fout;
      }
      return { ...gevonden, ...(validateAll?.(waarden) ?? {}) };
    },
    [controleerVeld, validateAll]
  );

  const setValue = React.useCallback(
    <K extends keyof Values & string>(veld: K, waarde: Values[K]) => {
      setPristine(false);
      setValuesState((vorige) => {
        const volgende = { ...vorige, [veld]: waarde };
        /* Een veld dat al fout stond, verbetert meteen mee: anders blijft een
           melding staan terwijl de gebruiker hem net heeft opgelost. */
        if (validateOn === "change" || errors[veld]) {
          const fout = controleerVeld(veld, volgende);
          setErrors((huidig) => ({ ...huidig, [veld]: fout }));
        }
        return volgende;
      });
    },
    [controleerVeld, errors, validateOn]
  );

  const setValues = React.useCallback((gedeelte: Partial<Values>) => {
    setPristine(false);
    setValuesState((vorige) => ({ ...vorige, ...gedeelte }));
  }, []);

  const setError = React.useCallback((veld: keyof Values & string, bericht?: string) => {
    setErrors((huidig) => ({ ...huidig, [veld]: bericht }));
  }, []);

  const setTouched = React.useCallback(
    (veld: keyof Values & string, aangeraakt = true) => {
      setTouchedState((huidig) => ({ ...huidig, [veld]: aangeraakt }));
      if (aangeraakt) {
        setValuesState((vorige) => {
          const fout = controleerVeld(veld, vorige);
          setErrors((huidig) => ({ ...huidig, [veld]: fout }));
          return vorige;
        });
      }
    },
    [controleerVeld]
  );

  const reset = React.useCallback((waarden?: Values) => {
    const doel = waarden ?? beginRef.current;
    beginRef.current = doel;
    setValuesState(doel);
    setErrors({});
    setTouchedState({});
    setPristine(true);
  }, []);

  const validateField = React.useCallback(
    (veld: keyof Values & string) => {
      const fout = controleerVeld(veld, values);
      setErrors((huidig) => ({ ...huidig, [veld]: fout }));
      return fout;
    },
    [controleerVeld, values]
  );

  const validateForm = React.useCallback(() => {
    const gevonden = controleerAlles(values);
    setErrors(gevonden);
    return gevonden;
  }, [controleerAlles, values]);

  const handleSubmit = React.useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      const gevonden = controleerAlles(values);
      setErrors(gevonden);
      setTouchedState(
        Object.fromEntries(Object.keys(values).map((veld) => [veld, true])) as FormTouched<Values>
      );
      if (Object.values(gevonden).some(Boolean)) return;

      const uitkomst = onSubmit?.(values);
      if (uitkomst instanceof Promise) {
        setSubmitting(true);
        uitkomst.finally(() => setSubmitting(false));
      }
    },
    [controleerAlles, onSubmit, values]
  );

  const fieldProps = React.useCallback(
    (veld: keyof Values & string) => ({
      error: touched[veld] ? errors[veld] : undefined,
    }),
    [errors, touched]
  );

  const inputProps = React.useCallback(
    (veld: keyof Values & string) => ({
      name: veld,
      value: (values[veld] ?? "") as string,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => setValue(veld, event.target.value as Values[typeof veld]),
      onBlur: () => setTouched(veld),
    }),
    [setTouched, setValue, values]
  );

  return {
    values,
    errors,
    touched,
    submitting,
    invalid: Object.values(errors).some(Boolean),
    pristine,
    setValue,
    setValues,
    setError,
    setTouched,
    reset,
    validateField,
    validateForm,
    handleSubmit,
    fieldProps,
    inputProps,
  };
}

/* -------------------------------- component ------------------------------- */

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** De uitkomst van useForm; regelt onSubmit en noValidate. */
  form?: Pick<UseFormReturn<Record<string, unknown>>, "handleSubmit">;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Ruimte tussen de velden. */
  gap?: "sm" | "md" | "lg";
}

/**
 * Form — dun jasje om <form>: schakelt de browservalidatie uit en stuurt het
 * versturen door naar useForm, zodat jouw meldingen die van de browser zijn.
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
  { form, onSubmit, gap = "md", className, ...rest },
  ref
) {
  return (
    <form
      ref={ref}
      noValidate
      className={cn("lui-form", `lui-form-${gap}`, className)}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (!event.defaultPrevented) form?.handleSubmit(event);
      }}
      {...rest}
    />
  );
});

export interface FormFieldProps extends FieldProps {
  /** Naam van het veld in useForm; haalt de foutmelding op. */
  name?: string;
  /**
   * De uitkomst van useForm. Het parametertype is `never` zodat elke
   * useForm-vorm past, ongeacht welke velden jouw formulier heeft.
   */
  form?: { fieldProps: (veld: never) => { error?: string } };
}

/** FormField — Field die zijn foutmelding zelf uit useForm haalt. */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
  { name, form, error, ...rest },
  ref
) {
  const uitForm = name && form ? form.fieldProps(name as never).error : undefined;
  return <Field ref={ref} error={error ?? uitForm} {...rest} />;
});

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Knoppen links uitlijnen in plaats van rechts. */
  align?: "start" | "end" | "between";
}

/** FormActions — rij met knoppen onderaan het formulier. */
export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(function FormActions(
  { align = "end", className, ...rest },
  ref
) {
  return <div ref={ref} className={cn("lui-form-actions", `lui-form-actions-${align}`, className)} {...rest} />;
});
