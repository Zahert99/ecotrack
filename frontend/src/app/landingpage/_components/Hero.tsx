"use client";

import { motion } from "framer-motion";

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto max-w-2xl text-center"
    >
      <h1 className="text-balance text-3xl font-semibold text-landing-ink sm:text-4xl">
        See your business travel emissions calculated in real time.
      </h1>
      <p className="mt-3 text-balance text-landing-muted">
        Pick a transport mode and distance below — the same server-side math EcoTrack
        runs on every trip, live in your browser.
      </p>
    </motion.div>
  );
}
