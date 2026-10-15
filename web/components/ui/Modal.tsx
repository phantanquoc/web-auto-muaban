"use client";
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  dark = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className={`relative w-full max-w-md rounded-xl2 p-5 shadow-pop ${dark ? 'bg-charcoal border border-white/10 text-white' : 'bg-white text-slate-900'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Dong" className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg opacity-70 hover:opacity-100">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
