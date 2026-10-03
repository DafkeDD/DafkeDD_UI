import * as React from "react";
import { cn } from "../lib/cn";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Toetsen als reeks, bv. ["⌘", "K"]. */
  keys?: string[];
}

/** Kbd — toont een toetsaanslag of sneltoets. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { keys, className, children, ...rest },
  ref
) {
  if (keys?.length) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={cn("lui-kbd-group", className)} {...rest}>
        {keys.map((key) => (
          <kbd key={key} className="lui-kbd">
            {key}
          </kbd>
        ))}
      </span>
    );
  }
  return (
    <kbd ref={ref as React.Ref<HTMLElement>} className={cn("lui-kbd", className)} {...rest}>
      {children}
    </kbd>
  );
});
