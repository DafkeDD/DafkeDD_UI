"use client";
import * as React from "react";
import { cn } from "../lib/cn";
import { Icon } from "../icons/icon";

export type Theme = "light" | "dark" | "system";

/** Dichtheid van bedieningselementen: hoogtes en binnenmarges schalen mee. */
export type Density = "compact" | "regular" | "comfy";

interface ThemeContextValue {
  theme: Theme;
  /** Het thema dat daadwerkelijk actief is (system opgelost). */
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggle: () => void;
  /** Compact, normaal of ruim. */
  density: Density;
  setDensity: (density: Density) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultDensity?: Density;
  /** Sleutel in localStorage; zet op null om niet te bewaren. */
  storageKey?: string | null;
}

/**
 * ThemeProvider — zet `data-theme` op <html> en onthoudt de keuze.
 * Alle kleuren komen uit de tokens, dus dit schakelt de hele UI om.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultDensity = "regular",
  storageKey = "lui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [density, setDensityState] = React.useState<Density>(defaultDensity);
  const [resolved, setResolved] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    if (!storageKey) return;
    try {
      const stored = window.localStorage.getItem(storageKey) as Theme | null;
      if (stored) setThemeState(stored);
      const storedDensity = window.localStorage.getItem(`${storageKey}-density`) as Density | null;
      if (storedDensity) setDensityState(storedDensity);
    } catch {
      /* localStorage kan geblokkeerd zijn */
    }
  }, [storageKey]);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const next = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      setResolved(next);
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.style.colorScheme = next;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = React.useCallback(
    (next: Theme) => {
      setThemeState(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        /* negeren */
      }
    },
    [storageKey]
  );

  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", density);
  }, [density]);

  const setDensity = React.useCallback(
    (next: Density) => {
      setDensityState(next);
      if (!storageKey) return;
      try {
        window.localStorage.setItem(`${storageKey}-density`, next);
      } catch {
        /* negeren */
      }
    },
    [storageKey]
  );

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolved,
      setTheme,
      toggle: () => setTheme(resolved === "dark" ? "light" : "dark"),
      density,
      setDensity,
    }),
    [theme, resolved, setTheme, density, setDensity]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** useTheme — huidig thema lezen en wijzigen. */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme() vereist een <ThemeProvider> hoger in de boom.");
  return context;
}

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

/** ThemeToggle — knop die wisselt tussen licht en donker. */
export const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(function ThemeToggle(
  { size = "md", className, onClick, ...rest },
  ref
) {
  const { resolved, toggle } = useTheme();

  return (
    <button
      ref={ref}
      type="button"
      className={cn("lui-theme-toggle", size === "sm" && "lui-theme-toggle-sm", className)}
      aria-label={resolved === "dark" ? "Naar lichte modus" : "Naar donkere modus"}
      {...rest}
      // Ná {...rest}: anders schakelt de knop niet meer zodra de gebruiker
      // zelf een onClick meegeeft.
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
    >
      <Icon name={resolved === "dark" ? "sun" : "moon"} size={size === "sm" ? 15 : 17} />
    </button>
  );
});

/**
 * Script dat het opgeslagen thema toepast vóór de eerste paint,
 * zodat er geen witte flits is. Plaats in <head>.
 */
export function ThemeScript({ storageKey = "lui-theme" }: { storageKey?: string }) {
  const code = `(function(){try{var t=localStorage.getItem('${storageKey}')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.setAttribute('data-theme',d?'dark':'light');r.style.colorScheme=d?'dark':'light';var y=localStorage.getItem('${storageKey}-density');if(y)r.setAttribute('data-density',y);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export interface DensityToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md";
  /** Eigen labels, standaard Compact / Normaal / Ruim. */
  labels?: Partial<Record<Density, string>>;
}

/** DensityToggle — wisselt tussen compact, normaal en ruim. */
export const DensityToggle = React.forwardRef<HTMLDivElement, DensityToggleProps>(
  function DensityToggle({ size = "md", labels, className, ...rest }, ref) {
    const { density, setDensity } = useTheme();
    const options: Array<{ value: Density; label: string }> = [
      { value: "compact", label: labels?.compact ?? "Compact" },
      { value: "regular", label: labels?.regular ?? "Normaal" },
      { value: "comfy", label: labels?.comfy ?? "Ruim" },
    ];

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Dichtheid"
        className={cn("lui-density-toggle", size === "sm" && "lui-density-toggle-sm", className)}
        {...rest}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={density === option.value}
            data-active={density === option.value ? "" : undefined}
            className="lui-density-btn"
            onClick={() => setDensity(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }
);
