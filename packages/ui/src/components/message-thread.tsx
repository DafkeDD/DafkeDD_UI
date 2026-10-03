"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface MessageThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Springt bij nieuwe berichten naar beneden (standaard aan). */
  autoScroll?: boolean;
}

/**
 * MessageThread — verloop van een gesprek: ticket, interne notities, chat.
 * Combineert met Composer voor de invoer eronder.
 */
export const MessageThread = React.forwardRef<HTMLDivElement, MessageThreadProps>(function MessageThread(
  { autoScroll = true, className, children, ...rest },
  ref
) {
  const eigen = React.useRef<HTMLDivElement>(null);
  const aantal = React.Children.count(children);

  React.useEffect(() => {
    if (!autoScroll) return;
    const node = eigen.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [autoScroll, aantal]);

  return (
    <div
      ref={(node) => {
        eigen.current = node;
        if (typeof ref === "function") ref(node as HTMLDivElement);
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn("lui-thread", className)}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface MessageDayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/** Scheiding tussen dagen: "Vandaag", "20 maart". */
export const MessageDay = React.forwardRef<HTMLDivElement, MessageDayProps>(function MessageDay(
  { className, children, ...rest },
  ref
) {
  return (
    <div ref={ref} className={cn("lui-thread-day", className)} {...rest}>
      <span>{children}</span>
    </div>
  );
});

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "me" rechts en in accentkleur, "them" links, "system" gecentreerd. */
  from?: "me" | "them" | "system";
  author?: React.ReactNode;
  time?: React.ReactNode;
  avatar?: React.ReactNode;
  /** Statusregel onder de bel, bijvoorbeeld "gelezen" of "verzonden". */
  status?: React.ReactNode;
  /** Interne notitie: amber, niet zichtbaar voor de klant. */
  internal?: boolean;
  /** Bijlagen of knoppen onder de tekst. */
  footer?: React.ReactNode;
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(function Message(
  { from = "them", author, time, avatar, status, internal, footer, className, children, ...rest },
  ref
) {
  if (from === "system") {
    return (
      <div ref={ref} className={cn("lui-thread-system", className)} {...rest}>
        {children}
        {time && <time className="lui-thread-system-time">{time}</time>}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("lui-message", `lui-message-${from}`, className)} {...rest}>
      {avatar && <span className="lui-message-avatar">{avatar}</span>}
      <div className="lui-message-column">
        {(author || time) && (
          <div className="lui-message-meta">
            {author && <span className="lui-message-author">{author}</span>}
            {time && <time className="lui-message-time">{time}</time>}
          </div>
        )}
        <div className={cn("lui-message-bubble", internal && "lui-message-internal")}>
          {internal && <span className="lui-message-internal-label">Interne notitie</span>}
          {children}
          {footer && <div className="lui-message-footer">{footer}</div>}
        </div>
        {status && <span className="lui-message-status">{status}</span>}
      </div>
    </div>
  );
});
