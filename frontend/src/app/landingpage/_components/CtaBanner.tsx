"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "./icons";

export function CtaBanner({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 rounded-2xl border border-landing-border bg-landing-surface px-6 py-10 text-center shadow-sm"
    >
      <ShieldCheck className="h-9 w-9 text-landing-accent" />
      <h2 className="max-w-xl text-balance text-3xl font-semibold text-landing-ink sm:text-4xl">
        Ready to simplify your SME&apos;s carbon tracking?
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-lg bg-landing-accent px-6 py-3 text-sm font-semibold text-landing-accent-foreground transition-colors hover:bg-landing-accent/90"
        >
          Get Started <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-landing-border px-6 py-3 text-sm font-semibold text-landing-ink transition-colors hover:bg-landing-bg"
        >
          Log In
        </Link>
      </div>
    </motion.div>
  );
}
