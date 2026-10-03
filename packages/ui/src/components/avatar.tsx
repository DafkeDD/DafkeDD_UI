"use client";
import * as React from "react";
import { cn } from "../lib/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Naam waaruit de initialen worden afgeleid. */
  name?: string;
  /** Eigen letters in plaats van de afgeleide initialen, bv. een trigram. */
  initials?: string;
  src?: string;
  alt?: string;
  size?: number;
  /** Vierkant met afgeronde hoeken in plaats van rond. */
  square?: boolean;
  /** Overschrijft de achtergrondkleur (standaard de accentkleur). */
  color?: string;
  /** Statusstip rechtsonder. */
  status?: "online" | "busy" | "offline";
}

export function initialsFrom(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Avatar — foto of initialen, met optionele statusstip. */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name = "", initials, src, alt, size = 36, square, color, status, className, style, children, ...rest },
  ref
) {
  const [failed, setFailed] = React.useState(false);
  const showImage = src && !failed;

  return (
    <span
      ref={ref}
      className={cn("lui-avatar", square && "lui-avatar-square", className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: color,
        ...style,
      }}
      {...rest}
    >
      {showImage ? (
        <img className="lui-avatar-img" src={src} alt={alt ?? name} onError={() => setFailed(true)} />
      ) : (
        (children ?? initials ?? initialsFrom(name))
      )}
      {status && (
        <span
          className={cn("lui-avatar-status", `lui-avatar-status-${status}`)}
          style={{ width: Math.max(8, size * 0.26), height: Math.max(8, size * 0.26) }}
        />
      )}
    </span>
  );
});

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximaal aantal zichtbare avatars; de rest wordt "+n". */
  max?: number;
  size?: number;
}

/** AvatarGroup — overlappende rij avatars met een "+n"-teller. */
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { max = 4, size = 30, className, children, ...rest },
  ref
) {
  const items = React.Children.toArray(children);
  const shown = items.slice(0, max);
  const rest_ = items.length - shown.length;

  return (
    <div ref={ref} className={cn("lui-avatar-group", className)} {...rest}>
      {shown.map((child, index) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size, key: index })
          : child
      )}
      {rest_ > 0 && (
        <span className="lui-avatar lui-avatar-more" style={{ width: size, height: size, fontSize: size * 0.34 }}>
          +{rest_}
        </span>
      )}
    </div>
  );
});
