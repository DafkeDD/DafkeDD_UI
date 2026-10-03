"use client";
/** Portal — rendert children in document.body (of een eigen container). */
import * as React from "react";
import { createPortal } from "react-dom";
import { useMounted } from "./hooks";

export function Portal({
  children,
  container,
}: {
  children: React.ReactNode;
  container?: Element | null;
}) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(children, container ?? document.body);
}
