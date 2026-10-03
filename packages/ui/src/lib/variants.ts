/**
 * variants — eigen mini-implementatie van het "class variance"-patroon.
 * Geen cva. Bouwt een klassenreeks op basis van props.
 *
 *   const button = variants({
 *     base: "lui-btn",
 *     variants: {
 *       variant: { primary: "lui-btn-primary", ghost: "lui-btn-ghost" },
 *       size:    { sm: "lui-btn-sm", md: "", lg: "lui-btn-lg" },
 *     },
 *     defaultVariants: { variant: "primary", size: "md" },
 *   });
 *
 *   button({ variant: "ghost" })  // -> "lui-btn lui-btn-ghost"
 */
import { cn, type ClassValue } from "./cn";

type VariantShape = Record<string, Record<string, ClassValue>>;

type VariantProps<V extends VariantShape> = {
  /** Naam van de variant, of een boolean voor true/false-varianten. */
  [K in keyof V]?: keyof V[K] | boolean | null | undefined;
};

export interface VariantConfig<V extends VariantShape> {
  base?: ClassValue;
  variants?: V;
  defaultVariants?: VariantProps<V>;
  compoundVariants?: Array<VariantProps<V> & { class: ClassValue }>;
}

export type VariantsFn<V extends VariantShape> = (
  props?: VariantProps<V> & { className?: ClassValue }
) => string;

export function variants<V extends VariantShape>(config: VariantConfig<V>): VariantsFn<V> {
  const { base, variants: map = {} as V, defaultVariants = {}, compoundVariants = [] } = config;

  return (props = {}) => {
    const { className, ...rest } = props as Record<string, unknown>;
    const resolved: Record<string, unknown> = { ...defaultVariants, ...stripUndefined(rest) };
    const classes: ClassValue[] = [base];

    for (const key in map) {
      const value = resolved[key];
      if (value == null) continue;
      const group = map[key];
      const picked = group[String(value)];
      if (picked) classes.push(picked);
    }

    for (const compound of compoundVariants) {
      const { class: extra, ...conditions } = compound as Record<string, unknown> & { class: ClassValue };
      const matches = Object.keys(conditions).every(
        (key) => String(resolved[key]) === String((conditions as Record<string, unknown>)[key])
      );
      if (matches) classes.push(extra);
    }

    classes.push(className as ClassValue);
    return cn(...classes);
  };
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key in obj) if (obj[key] !== undefined) out[key] = obj[key];
  return out;
}

export type { VariantProps };
