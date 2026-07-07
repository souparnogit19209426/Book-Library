"use client";

import { useEffect, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-[520px]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClassName?: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[90vh] w-full ${maxWidthClassName} overflow-y-auto rounded-3xl bg-surface shadow-[0_20px_40px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.06)] transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-3"
        }`}
      >
        <div className="flex items-center justify-between px-7 pt-6">
          <div className="font-serif text-xl text-text-1">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-lg text-text-2 transition hover:bg-surface-3"
          >
            ×
          </button>
        </div>
        <div className="px-7 pb-7 pt-5">{children}</div>
      </div>
    </div>
  );
}
