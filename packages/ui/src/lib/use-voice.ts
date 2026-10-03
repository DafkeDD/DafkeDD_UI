"use client";
import * as React from "react";

/**
 * useVoice — inspreken via de Web Speech API van de browser.
 * Geen externe bibliotheek, geen server: alles gebeurt lokaal in de browser.
 *
 * Ondersteuning: Chrome, Edge en Safari. Firefox heeft de API niet, daar geeft
 * `supported` false terug zodat je de knop kunt verbergen.
 */

export interface UseVoiceOptions {
  /** Taal van de herkenning. */
  lang?: string;
  /** Tekst terwijl er nog gesproken wordt. */
  onInterim?: (text: string) => void;
  /** Definitieve tekst wanneer de zin af is. */
  onFinal?: (text: string) => void;
  /** Meldingen voor de gebruiker (geen microfoon, niets gehoord, …). */
  onNotice?: (message: string, reason: VoiceNotice) => void;
  /** Blijft luisteren tot je zelf stopt. */
  continuous?: boolean;
}

export type VoiceNotice = "unsupported" | "denied" | "no-speech" | "error";

export interface VoiceApi {
  /** Luistert de microfoon op dit moment? */
  listening: boolean;
  /** Ondersteunt deze browser spraakherkenning? */
  supported: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

const MESSAGES: Record<VoiceNotice, string> = {
  unsupported: "Spraakherkenning werkt niet in deze browser.",
  denied: "Geef toegang tot de microfoon om in te spreken.",
  "no-speech": "Niets gehoord — probeer het opnieuw.",
  error: "Er ging iets mis bij het inspreken.",
};

export function useVoice(options: UseVoiceOptions = {}): VoiceApi {
  const { lang = "nl-BE", continuous = false } = options;
  const [listening, setListening] = React.useState(false);
  const [supported, setSupported] = React.useState(false);

  const recognition = React.useRef<SpeechRecognitionLike | null>(null);
  const callbacks = React.useRef(options);
  callbacks.current = options;

  React.useEffect(() => {
    setSupported(Boolean(getConstructor()));
    return () => {
      try {
        recognition.current?.stop();
      } catch {
        /* al gestopt */
      }
    };
  }, []);

  const notify = (reason: VoiceNotice) => {
    callbacks.current.onNotice?.(MESSAGES[reason], reason);
  };

  const stop = React.useCallback(() => {
    try {
      recognition.current?.stop();
    } catch {
      /* al gestopt */
    }
  }, []);

  const start = React.useCallback(() => {
    const Constructor = getConstructor();
    if (!Constructor) {
      notify("unsupported");
      return;
    }
    if (recognition.current) return;

    const instance = new Constructor();
    instance.lang = lang;
    instance.interimResults = true;
    instance.continuous = continuous;
    instance.maxAlternatives = 1;

    let latest = "";
    let committed = false;

    const commit = () => {
      if (committed) return;
      const value = latest.trim();
      if (!value) return;
      committed = true;
      callbacks.current.onFinal?.(value);
    };

    instance.onstart = () => setListening(true);

    instance.onresult = (event) => {
      let final = "";
      let interim = "";
      let hasFinal = false;

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) {
          final += result[0].transcript;
          hasFinal = true;
        } else {
          interim += result[0].transcript;
        }
      }

      const combined = `${final}${interim}`.trim();
      if (combined) {
        latest = combined;
        callbacks.current.onInterim?.(combined);
      }
      if (hasFinal && !continuous) {
        commit();
        stop();
      }
    };

    instance.onerror = (event) => {
      setListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") notify("denied");
      else if (event.error === "no-speech") notify("no-speech");
      else if (event.error !== "aborted") notify("error");
    };

    instance.onend = () => {
      setListening(false);
      recognition.current = null;
      commit();
    };

    recognition.current = instance;
    try {
      instance.start();
    } catch {
      setListening(false);
      recognition.current = null;
    }
  }, [lang, continuous, stop]);

  const toggle = React.useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, supported, start, stop, toggle };
}

/* ------------------------------------------------------------------ */
/* Minimale typering van de Web Speech API                             */
/* ------------------------------------------------------------------ */

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
}

interface SpeechResultEvent {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const scope = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}
