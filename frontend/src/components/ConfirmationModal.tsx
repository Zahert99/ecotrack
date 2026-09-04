"use client";

import { useEffect, useRef } from "react";
import type { SVGProps } from "react";

function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 9v4.5M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a1.5 1.5 0 0 0 1.3 2.25h17.76a1.5 1.5 0 0 0 1.3-2.25L13.71 3.86a1.5 1.5 0 0 0-2.42 0Z" />
    </svg>
  );
}

interface ConfirmationModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "destructive" | "default";
  isConfirming?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  isConfirming = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              tone === "destructive"
                ? "bg-destructive-muted text-destructive"
                : "bg-accent text-accent-foreground"
            }`}
          >
            <WarningIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 id="confirmation-modal-title" className="text-base font-semibold text-foreground">
              {title}
            </h3>
            <p id="confirmation-modal-description" className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded border border-destructive-muted bg-destructive-muted/50 p-2 text-sm text-destructive-muted-foreground"
          >
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="rounded px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
              tone === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {isConfirming ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
