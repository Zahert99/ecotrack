"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function readCssVar(name: string): string {
  // Canvas can't read CSS variables directly; getComputedStyle needs `document`,
  // which isn't available during SSR — the fallback never actually paints.
  if (typeof window === "undefined") return "#000000";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function readAll(names: string[]): Record<string, string> {
  return Object.fromEntries(names.map((name) => [name, readCssVar(name)]));
}

// next-themes applies its `.dark` class change inside a passive effect that
// runs strictly after render (next-themes' own `useEffect(() => applyTheme(...),
// [theme])`) — so reading CSS variables during render/useMemo on the same
// tick `resolvedTheme` changes still reads the *previous* class's values.
// Deferring the re-read to requestAnimationFrame guarantees it runs after
// that effect (and the resulting style recalc) has committed.
export function useThemeCssVars(names: string[]): Record<string, string> {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState<Record<string, string>>(() => readAll(names));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setColors(readAll(names)));
    return () => cancelAnimationFrame(raf);
    // `names` is a stable literal array per call site; only resolvedTheme
    // should trigger a re-read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  return colors;
}
