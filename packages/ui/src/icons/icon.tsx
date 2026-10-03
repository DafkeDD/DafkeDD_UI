import * as React from "react";
import { ICONS, type IconName } from "./icons";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
}

/**
 * Icon — rendert één glyph uit de eigen Dafke UI icon set.
 * Kleur volgt `currentColor`, dus elk component stuurt de kleur via CSS.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 16, strokeWidth = 2, className, ...rest },
  ref
) {
  const d = ICONS[name];
  if (!d) return null;

  return (
    <svg
      ref={ref}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {d.split(" M").map((segment, index) => (
        <path key={index} d={index === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  );
});

export { ICONS, ICON_NAMES } from "./icons";
export type { IconName } from "./icons";
