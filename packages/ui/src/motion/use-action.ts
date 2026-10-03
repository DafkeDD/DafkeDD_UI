"use client";
import * as React from "react";

export type ActionStage = "idle" | "busy" | "done" | "error";

export interface UseActionOptions {
  /** Het echte werk. `false` of een fout geeft de foutstatus. */
  onAction?: () => boolean | void | Promise<boolean | void>;
  /** Minimale duur van de animatie in ms; een snelle backend wacht hierop. */
  duration?: number;
  /** Terug naar het begin na zoveel ms; `false` blijft op het resultaat staan. */
  resetAfter?: number | false;
  onDone?: () => void;
}

/**
 * Kleine statusmachine achter de actieknoppen: idle → busy → done of error,
 * met een minimale speelduur en een reset. Ruimt zijn timers zelf op.
 */
export function useAction({ onAction, duration = 900, resetAfter = 2400, onDone }: UseActionOptions) {
  const [stage, setStage] = React.useState<ActionStage>("idle");
  const beurt = React.useRef(0);
  const timers = React.useRef<number[]>([]);
  const recent = React.useRef({ onAction, onDone });
  recent.current = { onAction, onDone };

  const stop = React.useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  React.useEffect(
    () => () => {
      beurt.current += 1;
      stop();
    },
    [stop]
  );

  const wacht = React.useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        timers.current.push(window.setTimeout(resolve, ms));
      }),
    []
  );

  const reset = React.useCallback(() => {
    beurt.current += 1;
    stop();
    setStage("idle");
  }, [stop]);

  const run = React.useCallback(async () => {
    if (stage === "busy") return;
    stop();
    const id = (beurt.current += 1);
    setStage("busy");

    let goed = true;
    try {
      const [antwoord] = await Promise.all([recent.current.onAction?.(), wacht(duration)]);
      goed = antwoord !== false;
    } catch {
      goed = false;
    }
    if (beurt.current !== id) return;

    setStage(goed ? "done" : "error");
    if (goed) recent.current.onDone?.();
    if (resetAfter === false) return;
    await wacht(resetAfter);
    if (beurt.current !== id) return;
    setStage("idle");
  }, [duration, resetAfter, stage, stop, wacht]);

  return { stage, run, reset };
}
