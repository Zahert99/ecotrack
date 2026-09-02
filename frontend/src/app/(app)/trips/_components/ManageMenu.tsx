"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EditIcon, MoreVerticalIcon, TrashIcon } from "./icons";

interface ManageMenuProps {
  editHref: string;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function ManageMenu({ editHref, onDelete, isDeleting }: ManageMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Manage trip"
        className="rounded p-1.5 text-muted-foreground hover:bg-muted"
      >
        <MoreVerticalIcon className="h-5 w-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-36 rounded-xl border border-border bg-background py-1 shadow-lg">
          <Link
            href={editHref}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            <EditIcon className="h-4 w-4" /> Edit
          </Link>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive-muted disabled:opacity-60"
          >
            <TrashIcon className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
