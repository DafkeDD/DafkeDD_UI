/**
 * Tests voor de gedeelde hooks in packages/ui/src/lib/hooks.ts.
 *
 * `it.fails(...)` = BEKENDE BUG. Zo'n test slaagt zolang de bug bestaat.
 * Is de bug opgelost, dan faalt hij juist — vervang dan `it.fails` door `it`.
 */
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { act, render, renderHook, fireEvent } from "@testing-library/react";
import {
  useControllableState,
  useEscapeKey,
  useLockScroll,
  usePresence,
} from "../../packages/ui/src/lib/hooks";

describe("useControllableState", () => {
  it("werkt uncontrolled met defaultValue", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 1 }));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
  });

  it("werkt controlled: de waarde volgt de prop en onChange wordt aangeroepen", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControllableState({ value, defaultValue: 0, onChange }),
      { initialProps: { value: 3 } }
    );
    act(() => result.current[1](4));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(result.current[0]).toBe(3); // nog niet bijgewerkt door de ouder
    rerender({ value: 4 });
    expect(result.current[0]).toBe(4);
  });

  it.fails("BEKENDE BUG: twee functionele updates in één tick tellen allebei mee", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 0 }));
    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });
    expect(result.current[0]).toBe(2);
  });

  it.fails("BEKENDE BUG: onChange wordt niet aangeroepen als de waarde gelijk blijft", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 7, onChange }));
    act(() => result.current[1](7));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("useLockScroll", () => {
  function Lock({ on }: { on: boolean }) {
    useLockScroll(on);
    return null;
  }

  it("blokkeert scrollen en zet het daarna terug", () => {
    const { rerender } = render(<Lock on />);
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<Lock on={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it.fails("BEKENDE BUG: geneste locks die in omgekeerde volgorde sluiten laten de pagina niet geblokkeerd", () => {
    function Twee({ a, b }: { a: boolean; b: boolean }) {
      return (
        <>
          <Lock on={a} />
          <Lock on={b} />
        </>
      );
    }
    const { rerender } = render(<Twee a b={false} />);
    rerender(<Twee a b />); // tweede overlay erbovenop
    rerender(<Twee a={false} b />); // eerst de onderste sluiten
    rerender(<Twee a={false} b={false} />); // dan de bovenste
    expect(document.body.style.overflow).toBe("");
  });
});

describe("useEscapeKey", () => {
  it("roept de handler aan bij Escape", () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("doet niets als hij uit staat", () => {
    const handler = vi.fn();
    renderHook(() => useEscapeKey(handler, false));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handler).not.toHaveBeenCalled();
  });

  it.fails("BEKENDE BUG: bij geneste lagen sluit Escape alleen de bovenste", () => {
    const onder = vi.fn();
    const boven = vi.fn();
    renderHook(() => useEscapeKey(onder));
    renderHook(() => useEscapeKey(boven));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(boven).toHaveBeenCalledTimes(1);
    expect(onder).not.toHaveBeenCalled();
  });
});

describe("usePresence", () => {
  function Box({ open }: { open: boolean }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const { render: zichtbaar, state } = usePresence(open, ref, 1000);
    if (!zichtbaar) return null;
    return (
      <div ref={ref} data-testid="box" data-state={state}>
        <button data-testid="kind">kind</button>
      </div>
    );
  }

  it("blijft na sluiten staan tot de animatie klaar is", () => {
    const { rerender, queryByTestId, getByTestId } = render(<Box open />);
    rerender(<Box open={false} />);
    expect(getByTestId("box").dataset.state).toBe("closed");
    act(() => {
      getByTestId("box").dispatchEvent(new Event("animationend"));
    });
    expect(queryByTestId("box")).toBeNull();
  });

  it("valt terug op de timer als er geen animatie draait", () => {
    vi.useFakeTimers();
    try {
      const { rerender, queryByTestId } = render(<Box open />);
      rerender(<Box open={false} />);
      act(() => vi.advanceTimersByTime(1000));
      expect(queryByTestId("box")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it.fails("BEKENDE BUG: een transitie van een kind-element sluit de overlay niet voortijdig af", () => {
    const { rerender, getByTestId, queryByTestId } = render(<Box open />);
    rerender(<Box open={false} />);
    act(() => {
      getByTestId("kind").dispatchEvent(new Event("transitionend", { bubbles: true }));
    });
    expect(queryByTestId("box")).not.toBeNull();
  });
});
