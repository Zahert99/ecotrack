"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useSpring } from "framer-motion";

export function useLiveCo2e(target: number, instant: boolean): number {
  const spring = useSpring(target, { stiffness: 140, damping: 22, mass: 0.6 });
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (instant) {
      spring.jump(target);
    } else {
      spring.set(target);
    }
  }, [spring, target, instant]);

  useMotionValueEvent(spring, "change", (latest) => setValue(latest));

  return value;
}
