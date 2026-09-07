"use client";

import { CtaBanner } from "./CtaBanner";
import { FeatureRibbon } from "./FeatureRibbon";
import { Hero } from "./Hero";
import { usePrefersReducedMotion } from "./shared/usePrefersReducedMotion";
import { Simulator } from "./simulator/Simulator";

export function LandingPage() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <main className="bg-landing-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
        <Hero reducedMotion={reducedMotion} />
        <Simulator reducedMotion={reducedMotion} />
        <FeatureRibbon />
        <CtaBanner reducedMotion={reducedMotion} />
      </div>
    </main>
  );
}
